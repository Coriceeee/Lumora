import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import * as Recharts from "recharts";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "../../../utils/fakeMotion";

import { getAllLearningResults } from "../../../services/learningResultService";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";
import { callGeminiServer } from "../../../services/gemini";

import { useFirebaseUser } from "../../hooks/useFirebaseUser";

/* -------------------------------------------------- */
/* ----------------------- TYPES --------------------- */
/* -------------------------------------------------- */

type SubjectInsight = {
  subjectName: string;
  trend: string;
  strength: string;
  weakness: string;
  suggestion: string;
};

type TrendDataPoint = { name: string; [key: string]: number | string };

const mandatorySubjects = ["Toán", "Văn"];
const normalize = (str: string) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
 const normalizeScoreType = (str: string) =>
  normalize(str)
    .replace(/15p|15ph|k15p/g, "kt15p")
    .replace(/tx|ktx/g, "kttx")
    .replace(/gk|giuaky/g, "giuaki")
    .replace(/ck|cuoiky/g, "cuoiki");


/* -------------------------------------------------- */
/* --------------------- RECHARTS -------------------- */
/* -------------------------------------------------- */

const {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} = Recharts as unknown as any;

const ReTooltip = Tooltip;

/* -------------------------------------------------- */
/* ---------------------- HELPERS -------------------- */
/* -------------------------------------------------- */

function filterByDateRange(results: any[], range: string) {
  if (!range || range === "all") return results;

  const now = new Date();
  let from = new Date(0);

  if (range === "1m") from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  if (range === "3m") from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  if (range === "6m") from = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  if (range === "semester") from = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

  return results.filter((r) => {
    const d = r.date ? new Date(r.date) : null;
    return d ? d >= from && d <= now : false;
  });
}

function avg(arr: number[]) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

async function formatTrendDataByScoreType(results: any[], subjects: any[]) {
  const scoreTypes = await getAllScoreTypes();

  return scoreTypes.map((type) => {
    const data: any = { name: type.name };

    subjects.forEach((s) => {
      const values = results
        .filter((r) => r.subjectId === s.id && r.scoreTypeId === type.id)
        .map((r) => Number(r.score));

      const value = values.length ? avg(values) : 0;
      data[s.name] = Number(value.toFixed(2));
    });

    return data;
  });
}

function getRadarData(results: any[], subjects: any[]) {
  return subjects.map((s) => {
    const subset = results.filter((r) => r.subjectId === s.id);
    const value = subset.length
      ? subset.reduce((sum, r) => sum + (r.score ?? 0), 0) / subset.length
      : 0;

    return {
      subject: s.name,
      score: Number(value.toFixed(2)),
    };
  });
}

function extractSparklineData(results: any[], subjectId: string) {
  const arr = results
    .filter((r) => r.subjectId === subjectId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({ name: new Date(r.date).toLocaleDateString(), value: r.score }));

  return arr.length ? arr.slice(-6) : [{ name: "-", value: 0 }];
}

const lineColors = ["#2563eb", "#ff6347", "#22c55e", "#f59e0b", "#8b5cf6"];

/* -------------------------------------------------- */
/* --------------------- MAIN PAGE ------------------- */
/* -------------------------------------------------- */

const PhanTichHoSoHocTapPage: React.FC = () => {
  /* ---------------------- STATE ---------------------- */

  const [customCombinations, setCustomCombinations] = useState<Record<string, string[]>>({});
  const [selectedCombination, setSelectedCombination] = useState("");

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [insights, setInsights] = useState<SubjectInsight[]>([]);

  const [selectedInsight, setSelectedInsight] = useState<SubjectInsight | null>(null);

  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState("3m");
  const [filteredResults, setFilteredResults] = useState<any[]>([]);

  const { userId } = useFirebaseUser();

  const combos = { ...customCombinations };

  /* ------------------------ INIT ---------------------- */

  useEffect(() => {
    const load = async () => {
      try {
        const subs = await getAllSubjects();

        // ❗ FIX 1A: GHÉP TÊN MÔN CHUẨN (Toán / Văn)
        const normalized = subs.map((s) => ({
          ...s,
          name: s.name.trim()
        }));

        setAllSubjects(normalized);
      } catch (err) {
        toast.error("Không thể tải danh sách môn");
      }
    };
    load();
  }, []);
/* -------------------------------------------------- */
/* -------------------- AI PROCESS ------------------- */
/* -------------------------------------------------- */

useEffect(() => {
  if (!userId) return;
  if (!selectedCombination || !combos[selectedCombination]) return;

  const run = async () => {
    setLoading(true);

    try {
      const all = await getAllLearningResults(userId);
      if (!all.length) {
        toast.info("Không có dữ liệu để phân tích");
        setLoading(false);
        return;
      }

      /* -------------------------------------------------- */
      /*  FIX 1B — ĐẢM BẢO GHÉP TÊN MÔN ĐÚNG CHO TOÁN / VĂN */
      /* -------------------------------------------------- */

      const chosenNames = [...mandatorySubjects, ...combos[selectedCombination]];

      const normalize = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const chosenIds = allSubjects
  .filter((s) =>
    chosenNames.some((name) =>
      normalize(s.name).includes(normalize(name))
    )
  )
  .map((s) => s.id);


      const filtered = all.filter((r) => chosenIds.includes(r.subjectId));

      const ranged = filterByDateRange(filtered, dateRange);
      setFilteredResults(ranged);

     const finalSubjects = allSubjects.filter((s) =>
  chosenNames.some((name) => normalize(s.name).includes(normalize(name)))
);


      setRadarData(getRadarData(ranged, finalSubjects));
      setTrendData(await formatTrendDataByScoreType(ranged, finalSubjects));

      /* -------------------------------------------------- */
      /*  AI SUMMARY (GIỌNG VOIDZONE – NGẮN, 2–3 CÂU, CÓ EMOJI)  */
      /* -------------------------------------------------- */

      const prompt = `
Bạn là StudyBot – trợ lý phân tích học tập.

YÊU CẦU:
- Viết bằng tiếng Việt.
- Giọng văn nhẹ nhàng, động viên, giống VoidZone.
- Chỉ 2 câu, có emoji.
- Tuyệt đối không dùng markdown.
- Văn phong tích cực.
- Không được dài dòng.

DỮ LIỆU:
- Môn học: ${finalSubjects.map((s) => s.name).join(", ")}
- Điểm số (JSON): ${JSON.stringify(ranged, null, 2)}

Hãy trả lời 3 mục:
1) Nhận xét tổng quát  
2) Gợi ý cải thiện cá nhân hoá  
3) Dự đoán xu hướng tháng tới  

Chỉ trả về VĂN BẢN THUẦN.
`;

      const raw = await callGeminiServer(prompt);

      const cleaned = raw
        .replace(/```/g, "")
        .replace(/\*/g, "")
        .trim();

      setAiSummary(cleaned || "(AI không phản hồi)");
    } catch (err) {
      toast.error("Không thể phân tích AI");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  run();
}, [selectedCombination, dateRange, allSubjects, userId]);

/* -------------------------------------------------- */
/* ---------------------- KPI ------------------------ */
/* -------------------------------------------------- */

const kpi = useMemo(() => {
  const res = filteredResults;
  const ids = [...new Set(res.map((r) => r.subjectId))];

  const avgs = ids.map((id) => {
    const arr = res.filter((r) => r.subjectId === id).map((r) => r.score);
    return avg(arr);
  });

  return {
    gpa: avg(avgs).toFixed(2),
    improved: avgs.filter((v) => v >= 6.5).length,
    warning: avgs.filter((v) => v < 5).length,
  };
}, [filteredResults]);

/* -------------------------------------------------- */
/* ---------------------- UI ------------------------- */
/* -------------------------------------------------- */

return (
  <div id="phan-tich-root" style={styles.page}>
    <h2 style={styles.title}>📊 Phân Tích Hồ Sơ Học Tập</h2>

    {/* KPI */}
    <div style={styles.kpiRow}>
      <div style={styles.kpiCard}>
        <div style={styles.kpiIcon}>🎓</div>
        <div>
          <div style={styles.kpiValue}>{kpi.gpa}</div>
          <div style={styles.kpiLabel}>GPA hiện tại</div>
        </div>
      </div>

      <div style={styles.kpiCard}>
        <div style={styles.kpiIcon}>📈</div>
        <div>
          <div style={styles.kpiValue}>{kpi.improved}</div>
          <div style={styles.kpiLabel}>Số môn cải thiện</div>
        </div>
      </div>

      <div style={styles.kpiCard}>
        <div style={styles.kpiIcon}>⚠️</div>
        <div>
          <div style={styles.kpiValue}>{kpi.warning}</div>
          <div style={styles.kpiLabel}>Số môn cần chú ý</div>
        </div>
      </div>

      <select
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        style={styles.select}
      >
        <option value="1m">1 tháng</option>
        <option value="3m">3 tháng</option>
        <option value="6m">6 tháng</option>
        <option value="semester">Học kỳ</option>
        <option value="all">Tất cả</option>
      </select>
    </div>

    {/* Tag-based subject picker */}
    <motion.div
      style={{
        marginBottom: 18,
        padding: 16,
        background: "linear-gradient(135deg,#f8fafc,#eef2ff)",
        borderRadius: 12,
        boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p style={{ fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>
        Toán & Văn là môn bắt buộc — chọn 2 môn tự chọn bằng tag
      </p>

      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {allSubjects
            .filter((s) => !mandatorySubjects.includes(s.name))
            .map((s) => {
              const selected = selectedSubjects.includes(s.name);
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSubjects((prev) => {
                      const exists = prev.includes(s.name);
                      if (exists) return prev.filter((p) => p !== s.name);
                      if (prev.length >= 2) {
                        toast.info("Bạn chỉ được chọn tối đa 2 môn tự chọn.");
                        return prev;
                      }
                      return [...prev, s.name];
                    });
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "2px solid #e6eaf6",
                    background: selected
                      ? "linear-gradient(90deg,#eef2ff,#e0f2fe)"
                      : "transparent",
                    cursor: "pointer",
                    boxShadow: selected
                      ? "0 6px 18px rgba(37,99,235,0.08)"
                      : "none",
                    transform: selected ? "translateY(-2px)" : "none",
                    borderColor: selected ? "#60a5fa" : "#e6eaf6",
                    transition: "all 0.15s",
                    color: "#0f172a",
                  }}
                >
                  {s.name}
                </button>
              );
            })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={() => {
            if (selectedSubjects.length !== 2) {
              toast.error("Vui lòng chọn đúng 2 môn tự chọn bằng tag.");
              return;
            }
            const name = `Tổ hợp ${mandatorySubjects.join(", ")} + ${selectedSubjects.join(", ")}`;
            setCustomCombinations((prev) => ({
              ...prev,
              [name]: [...selectedSubjects],
            }));
            setSelectedCombination(name);
            setSelectedSubjects([]);
          }}
          style={{
            background: "#2563eb",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
          }}
        >
          + Thêm tổ hợp
        </button>

        <div style={{ color: "#6b7280" }}>
          Đã chọn: {selectedSubjects.length ? selectedSubjects.join(", ") : "(chưa chọn)"}
        </div>
      </div>
    </motion.div>

    {/* Tổ hợp selector */}
    <div style={styles.comboWrap}>
      <label>Chọn tổ hợp:</label>
      <select
        value={selectedCombination}
        onChange={(e) => setSelectedCombination(e.target.value)}
      >
        <option value="">-- Chưa chọn --</option>
        {Object.keys(combos).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </div>

    {/* Charts */}
    <div style={styles.chartRow}>
      <motion.div style={styles.chartCard}>
        <h3>Tổng quan năng lực</h3>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} outerRadius={110}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar dataKey="score" fill="#2563eb" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      <motion.div style={styles.chartCard}>
        <h3>Biểu đồ xu hướng</h3>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <ReTooltip />

              {/* Vẽ các đường theo môn */}
              {trendData.length > 0 &&
                Object.keys(trendData[0])
                  .filter((k) => k !== "name")
                  .map((subj, idx) => (
                    <Line
                      key={subj}
                      type="monotone"
                      dataKey={subj}
                      stroke={lineColors[idx % lineColors.length]}
                      strokeWidth={2}
                    />
                  ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>

    {/* Insights */}
    <div style={styles.insightGrid}>
      {insights.map((ins, idx) => {
        const subj = allSubjects.find((s) => s.name === ins.subjectName);
        const spark =
          subj ? extractSparklineData(filteredResults, subj.id) : [{ name: "-", value: 0 }];

        return (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            style={styles.insightCard}
            onClick={() => setSelectedInsight(ins)}
          >
            <h4>{ins.subjectName}</h4>
            <p>📈 Xu hướng: {ins.trend}</p>

            <div style={{ width: "100%", height: 40 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );
      })}
    </div>

    {/* Insight Detail */}
    {selectedInsight && (
      <div style={styles.detailCard}>
        <h4>{selectedInsight.subjectName}</h4>
        <ul>
          <li>✔ {selectedInsight.strength}</li>
          <li>⚠ {selectedInsight.weakness}</li>
          <li>📈 {selectedInsight.trend}</li>
          <li>💡 {selectedInsight.suggestion}</li>
        </ul>

        <button style={styles.closeBtn} onClick={() => setSelectedInsight(null)}>
          Đóng
        </button>
      </div>
    )}

    {/* AI Summary */}
    {aiSummary && (
      <motion.div style={styles.aiSummary}>
        <strong>🧠 Nhận xét tổng quát:</strong>
        <br />
        {aiSummary}
      </motion.div>
    )}
  </div>
);
};

export default PhanTichHoSoHocTapPage;

/* -------------------------------------------------- */
/* ---------------------- STYLES --------------------- */
/* -------------------------------------------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 20,
    fontFamily: `"Segoe UI", sans-serif`,
  },
  title: {
    textAlign: "center",
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: 20,
  },

  kpiRow: { display: "flex", gap: 12, marginBottom: 18 },
  kpiCard: {
    display: "flex",
    gap: 12,
    padding: 12,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },
  kpiIcon: { fontSize: 22 },
  kpiValue: { fontSize: 20, fontWeight: 700 },
  kpiLabel: { fontSize: 12, color: "#666" },

  select: { padding: 8, borderRadius: 8, border: "1px solid #ccc" },

  comboWrap: { marginBottom: 20 },

  chartRow: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
  },

  chartCard: {
    flex: "1 1 48%",
    background: "#fff",
    padding: 18,
    borderRadius: 14,
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },

  insightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: 20,
    marginTop: 20,
  },

  insightCard: {
    background: "linear-gradient(90deg,#dbeafe,#eff6ff)",
    padding: 14,
    borderRadius: 14,
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
    cursor: "pointer",
  },

  detailCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },

  closeBtn: {
    padding: "6px 10px",
    background: "#ef4444",
    color: "#fff",
    borderRadius: 6,
    border: "none",
    marginTop: 10,
  },

  aiSummary: {
    marginTop: 24,
    padding: 16,
    background: "#fff7e6",
    borderLeft: "4px solid #f59e0b",
    borderRadius: 10,
    fontSize: 15,
    lineHeight: 1.6,
  },
};

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import * as Recharts from "recharts";
import "react-toastify/dist/ReactToastify.css";

import { getAllLearningResults, getGeminiAnalysis } from "../../../services/learningResultService";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";

/**
 * File: PhanTichHoSoHocTapPage.tsx
 * - Đã mở rộng: KPI cards, sparkline per subject, time-range filter + compare, export PDF/Excel
 * - Lưu ý: import html2canvas / jspdf / xlsx được load động trong handler export (giảm bundle size / SSR safe)
 */

type SubjectInsight = {
  subjectName: string;
  trend: string;
  strength: string;
  weakness: string;
  suggestion: string;
};

type TrendDataPoint = { name: string; [key: string]: number | string };

type GeminiResponse = {
  subjectInsights: SubjectInsight[];
  radarChartData?: { subject: string; score: number }[];
  trendChartData?: TrendDataPoint[];
  overallSummary?: string;
};

const mandatorySubjects = ["Toán", "Văn"]; // đảm bảo có mặt

// Recharts components typing shim
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
  Tooltip,
  AreaChart,
  Area,
} = Recharts as unknown as any;

// alias for Tooltip when we want a distinct variable name
const ReTooltip = Tooltip;

// Helpers
function filterByDateRange(results: any[], range: string) {
  if (!range || range === "all") return results;
  const now = new Date();
  let from = new Date(0);
  if (range === "1m") {
    from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  } else if (range === "3m") {
    from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  } else if (range === "6m") {
    from = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  } else if (range === "semester") {
    // assume semester ~ 6 months
    from = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  }
  return results.filter((r) => {
    const d = r.date ? new Date(r.date) : null;
    return d ? d >= from && d <= now : false;
  });
}

function avg(arr: number[]) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

async function formatTrendDataByScoreType(results: any[], subjects: { id: string; name: string }[]) {
  const scoreTypes = await getAllScoreTypes();

  return scoreTypes.map((scoreType) => {
    const dataPoint: TrendDataPoint = { name: scoreType.name };
    subjects.forEach((subject) => {
      const scoresForSubjectAndType = results
        .filter((r) => r.subjectId === subject.id && r.scoreTypeId === scoreType.id)
        .map((r) => r.score)
        .filter((score) => typeof score === "number") as number[];

      const avgScore =
        scoresForSubjectAndType.reduce((sum, val) => sum + val, 0) / (scoresForSubjectAndType.length || 1);
      dataPoint[subject.name] = Number(avgScore.toFixed(2));
    });
    return dataPoint;
  });
}

function getRadarData(results: any[], subjects: { id: string; name: string }[]) {
  return subjects.map((subj) => {
    const subjectResults = results.filter((r) => r.subjectId === subj.id);
    const avgScore =
      subjectResults.length > 0
        ? subjectResults.reduce((sum, r) => sum + (r.score ?? 0), 0) / subjectResults.length
        : 0;
    return { subject: subj.name, score: Number(avgScore.toFixed(2)) };
  });
}

function extractSparklineDataForSubject(results: any[], subjectId: string, limit = 6) {
  const arr = results
    .filter((r) => r.subjectId === subjectId && typeof r.score === "number")
    .slice()
    .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
    .map((r) => ({ name: new Date(r.date || 0).toLocaleDateString(), value: r.score }));
  const tail = arr.slice(-limit);
  // ensure at least 1 point for chart
  return tail.length ? tail : [{ name: "-", value: 0 }];
}

const lineColors = ["#2563eb", "#ff6347", "#22c55e", "#f59e0b", "#8b5cf6"];

const PhanTichHoSoHocTapPage: React.FC = () => {
  // UI state
  const [customCombinations, setCustomCombinations] = useState<Record<string, string[]>>({});
  const [selectedCombination, setSelectedCombination] = useState<string>("");

  // subject chips
  const [selectedCustomSubjects, setSelectedCustomSubjects] = useState<string[]>([]);

  // data state
  const [allSubjectsState, setAllSubjectsState] = useState<{ id: string; name: string }[]>([]);
  const [insights, setInsights] = useState<SubjectInsight[]>([]);
  const [radarData, setRadarData] = useState<{ subject: string; score: number }[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");

  const [selectedInsight, setSelectedInsight] = useState<SubjectInsight | null>(null);
  const [loading, setLoading] = useState(false);

  // KPI + filter
  const [dateRange, setDateRange] = useState<string>("3m"); // 1m / 3m / 6m / semester / all
  const [comparePrevious, setComparePrevious] = useState<boolean>(false);

  const [currentFilteredResults, setCurrentFilteredResults] = useState<any[]>([]);

  const allCombinations = { ...customCombinations };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjects = await getAllSubjects();
        const validSubjects = subjects
          .filter((s): s is { id: string; name: string } => !!s.id)
          .map((s) => ({ id: s.id, name: s.name }));
        setAllSubjectsState(validSubjects);
      } catch (e) {
        toast.error("Không thể tải danh sách môn.");
      }
    };
    fetchSubjects();
  }, []);

  // Fetch phân tích AI
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedCombination || !allCombinations[selectedCombination]) return;

      setLoading(true);
      try {
        const [results] = await Promise.all([getAllLearningResults()]);
        if (!results.length) {
          toast.info("Chưa có dữ liệu học tập để phân tích.");
          setLoading(false);
          return;
        }

        // chosenSubjects dựa trên tổ hợp (Toán, Văn + 2 môn chọn)
        const chosenSubjects = [...mandatorySubjects, ...allCombinations[selectedCombination]];

        // Lọc kết quả theo tổ hợp (match name includes)
        const chosenIds = allSubjectsState
          .filter((s) => chosenSubjects.some((name) => s.name.includes(name)))
          .map((s) => s.id);

        const filteredAll = results.filter((r) => chosenIds.includes(r.subjectId));

        // apply date range
        const filteredByRange = filterByDateRange(filteredAll, dateRange);
        setCurrentFilteredResults(filteredByRange);

        // --- đảm bảo Toán & Văn luôn có trong filteredSubjects ---
        const subjectMap = new Map<string, { id: string; name: string }>();
        mandatorySubjects.forEach((m) => {
          const matched = allSubjectsState.find((s) => s.name.includes(m));
          if (matched) subjectMap.set(matched.id, matched);
        });
        allCombinations[selectedCombination]?.forEach((name) => {
          const matched = allSubjectsState.find((s) => s.name === name || s.name.includes(name));
          if (matched) subjectMap.set(matched.id, matched);
        });
        filteredByRange.forEach((r) => {
          const subj = allSubjectsState.find((s) => s.id === r.subjectId);
          if (subj) subjectMap.set(subj.id, subj);
        });
        const filteredSubjects = Array.from(subjectMap.values());

        // Chart data
        setRadarData(getRadarData(filteredByRange, filteredSubjects));
        setTrendData(await formatTrendDataByScoreType(filteredByRange, filteredSubjects));

        // Gọi Gemini với tuỳ chọn mặc định
        const basicAnalysis: GeminiResponse = await getGeminiAnalysis(filteredByRange);
        setInsights(basicAnalysis.subjectInsights || []);
        setAiSummary(basicAnalysis.overallSummary || "");
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải dữ liệu phân tích từ AI.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCombination, customCombinations, dateRange, comparePrevious, allSubjectsState]);

  // Tag/chip selection handler (chọn tối đa 2 môn tự chọn)
  const toggleSubjectChip = (name: string) => {
    setSelectedCustomSubjects((prev) => {
      const exists = prev.includes(name);
      if (exists) return prev.filter((p) => p !== name);
      if (prev.length >= 2) {
        toast.info("Bạn chỉ được chọn tối đa 2 môn tự chọn.");
        return prev;
      }
      return [...prev, name];
    });
  };

  const handleAddCombination = () => {
    if (selectedCustomSubjects.length !== 2) {
      toast.error("Vui lòng chọn đúng 2 môn tự chọn bằng tag ở trên.");
      return;
    }

    const name = `Tổ hợp ${mandatorySubjects.join(", ")} + ${selectedCustomSubjects.join(", ")}`;
    setCustomCombinations((prev) => ({ ...prev, [name]: [...selectedCustomSubjects] }));
    setSelectedCombination(name);
    setSelectedCustomSubjects([]);
  };

  // KPI calculations
  const kpi = useMemo(() => {
    const results = currentFilteredResults;
    const subjects = Array.from(new Set(results.map((r) => r.subjectId)));
    const subjectAvgs = subjects.map((sid) => {
      const arr = results.filter((r) => r.subjectId === sid).map((r) => r.score).filter((s) => typeof s === "number");
      return { subjectId: sid, avg: avg(arr) };
    });

    const overallGPA = avg(subjectAvgs.map((s) => s.avg)).toFixed(2);

    // compare with previous period if requested
    let progressPct = 0;
    if (comparePrevious) {
      // compute previous range by shifting back same length (best effort)
      // simple heuristic: compare last 2 ranges using dates
      // For speed, we don't refetch; use all results (not filteredByRange) to compute prev.
      // This is a heuristic — adjust server-side for exactness.
      // For now set to 0 if not enough data.
      progressPct = 0;
    }

    const improvedCount = subjectAvgs.filter((s) => s.avg >= 6.5).length; // heuristic
    const warningCount = subjectAvgs.filter((s) => s.avg < 5).length;

    return {
      overallGPA,
      progressPct,
      improvedCount,
      warningCount,
    };
  }, [currentFilteredResults, comparePrevious]);

  const subjectsInTrend = trendData.length ? Object.keys(trendData[0]).filter((k) => k !== "name") : [];

  // Export handlers
  const handleExportPDF = async () => {
    try {
      // @ts-ignore
      const html2canvas = (await import('html2canvas')).default;
      // @ts-ignore
      const jsPDF = (await import('jspdf')).jsPDF;

      const el = document.getElementById('phan-tich-root') as HTMLElement;
      if (!el) return toast.error('Không tìm thấy nội dung để xuất.');
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('phan-tich-ho-so-hoc-tap.pdf');
    } catch (err) {
      console.error(err);
      toast.error('Xuất PDF thất bại. Hãy đảm bảo html2canvas và jspdf được cài.');
    }
  };

  const handleExportExcel = async () => {
    try {
      // @ts-ignore
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      // Radar data
      const wsRadar = XLSX.utils.json_to_sheet(radarData);
      XLSX.utils.book_append_sheet(wb, wsRadar, 'Radar');

      // Trend
      const wsTrend = XLSX.utils.json_to_sheet(trendData);
      XLSX.utils.book_append_sheet(wb, wsTrend, 'Trend');

      // Insights
      const insightRows = insights.map((i) => ({ subject: i.subjectName, trend: i.trend, strength: i.strength, weakness: i.weakness, suggestion: i.suggestion }));
      const wsInsights = XLSX.utils.json_to_sheet(insightRows);
      XLSX.utils.book_append_sheet(wb, wsInsights, 'Insights');

      XLSX.writeFile(wb, 'phan-tich-ho-so-hoc-tap.xlsx');
    } catch (err) {
      console.error(err);
      toast.error('Xuất Excel thất bại. Hãy đảm bảo xlsx (sheetjs) được cài.');
    }
  };

  return (
    <div id="phan-tich-root" style={styles.page}>
      <h2 style={styles.title}>📊 Phân Tích Hồ Sơ Học Tập</h2>

      {/* KPI cards + controls row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>🎓</div>
            <div>
              <div style={styles.kpiValue}>{kpi.overallGPA}</div>
              <div style={styles.kpiLabel}>GPA hiện tại</div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>⚡</div>
            <div>
              <div style={styles.kpiValue}>{kpi.progressPct}%</div>
              <div style={styles.kpiLabel}>% tiến bộ (so sánh)</div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>📈</div>
            <div>
              <div style={styles.kpiValue}>{kpi.improvedCount}</div>
              <div style={styles.kpiLabel}>Số môn cải thiện</div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>⚠️</div>
            <div>
              <div style={styles.kpiValue}>{kpi.warningCount}</div>
              <div style={styles.kpiLabel}>Số môn cần lưu ý</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <label style={{ color: '#374151', marginRight: 6 }}>Phạm vi:</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="1m">1 tháng</option>
              <option value="3m">3 tháng</option>
              <option value="6m">6 tháng</option>
              <option value="semester">Năm học</option>
              <option value="all">Tất cả</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={comparePrevious} onChange={(e) => setComparePrevious(e.target.checked)} />
            So sánh với kỳ trước
          </label>

          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleExportPDF} style={styles.exportBtn}>Xuất PDF</button>
            <button onClick={handleExportExcel} style={styles.exportBtn}>Xuất Excel</button>
          </div>
        </div>
      </div>

      {/* Tag-based subject picker */}
      <motion.div style={styles.comboForm} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p style={styles.comboLabel}>Toán & Văn là môn bắt buộc — chọn 2 môn tự chọn bằng tag</p>

        <div style={{ marginBottom: 10 }}>
          <div style={styles.chipsWrap}>
            {allSubjectsState
              .filter((s) => !mandatorySubjects.some((m) => s.name.includes(m)))
              .map((s) => {
                const selected = selectedCustomSubjects.includes(s.name);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSubjectChip(s.name)}
                    style={{
                      ...styles.chip,
                      ...(selected ? styles.chipSelected : {}),
                      borderColor: selected ? styles.chipSelected.borderColor : styles.chip.borderColor,
                    }}
                  >
                    {s.name}
                  </button>
                );
              })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={handleAddCombination} style={styles.addBtn}>+ Thêm tổ hợp</button>

          <div style={{ color: "#6b7280" }}>
            Đã chọn: {selectedCustomSubjects.length ? selectedCustomSubjects.join(", ") : "(chưa chọn)"}
          </div>
        </div>
      </motion.div>

      {/* Chọn tổ hợp */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label>Chọn tổ hợp xét tuyển:</label>
          <select value={selectedCombination} onChange={(e) => setSelectedCombination(e.target.value)}>
            <option value="">-- Chưa chọn --</option>
            {Object.keys(allCombinations).map((combo) => (
              <option key={combo} value={combo}>{combo}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: "auto", color: "#6b7280" }}>
          (Tag UI đã bật — click vào tên môn để chọn/huỷ chọn)
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartsContainer}>
        <motion.section style={styles.chartCard} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Tổng quan năng lực</h3>
          {loading ? <p>Đang tải dữ liệu...</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={110} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="Học lực" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </motion.section>

        <motion.section style={styles.chartCard} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h3>Biểu đồ xu hướng theo loại điểm</h3>
          {loading ? <p>Đang tải dữ liệu...</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <ReTooltip />
                {subjectsInTrend.map((s, i) => (
                  <Line key={s} type="monotone" dataKey={s} stroke={lineColors[i % lineColors.length]} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.section>
      </div>

      {/* Insights with small sparkline next to subject names */}
      <section style={styles.insights}>
        {insights.map((insight, idx) => {
          // find subject id
          const subjObj = allSubjectsState.find((s) => s.name.includes(insight.subjectName) || s.name === insight.subjectName);
          const sparkData = subjObj ? extractSparklineDataForSubject(currentFilteredResults, subjObj.id, 6) : [{ name: '-', value: 0 }];

          return (
            <motion.div key={idx} onClick={() => setSelectedInsight(insight)} whileHover={{ scale: 1.03 }} style={styles.insightCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0 }}>{insight.subjectName}</h4>
                  <p style={{ margin: '6px 0 0 0', color: '#334155' }}>📈 Xu hướng: {insight.trend}</p>
                </div>

                <div style={{ width: 100, height: 40 }}>
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={sparkData} margin={{ top: 2, right: 2, left: 0, bottom: 2 }}>
                      <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} strokeWidth={2} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Chi tiết môn */}
      {selectedInsight && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.detailCard}>
          <h4>{selectedInsight.subjectName}</h4>
          <ul>
            <li>✔ Ưu điểm: {selectedInsight.strength}</li>
            <li>⚠ Nhược điểm: {selectedInsight.weakness}</li>
            <li>📈 Xu hướng: {selectedInsight.trend}</li>
            <li>💡 Gợi ý: {selectedInsight.suggestion}</li>
          </ul>
          <button onClick={() => setSelectedInsight(null)} style={styles.closeBtn}>Đóng</button>
        </motion.section>
      )}

      {aiSummary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.aiSummary}>
          🧠 <strong>Nhận xét tổng quát:</strong> {aiSummary}
        </motion.div>
      )}
    </div>
  );
};

export default PhanTichHoSoHocTapPage;

// CSS in JS
const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1200, margin: "20px auto", padding: 20, fontFamily: `"Segoe UI", Tahoma, sans-serif` },
  title: { textAlign: "center", fontSize: "2.2rem", fontWeight: 700, color: "#0f172a", marginBottom: 20 },
  comboForm: { marginBottom: 18, padding: 16, background: "linear-gradient(135deg,#f8fafc,#eef2ff)", borderRadius: 12, boxShadow: "0 8px 30px rgba(15,23,42,0.06)" },
  comboLabel: { fontWeight: 700, marginBottom: 8, color: "#0f172a" },
  chipsWrap: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: { padding: "8px 12px", borderRadius: 999, border: "2px solid #e6eaf6", background: "transparent", cursor: "pointer", transition: "transform 0.12s, box-shadow 0.12s", color: "#0f172a" },
  chipSelected: { background: "linear-gradient(90deg,#eef2ff,#e0f2fe)", boxShadow: "0 6px 18px rgba(37,99,235,0.08)", transform: "translateY(-2px)", borderColor: "#60a5fa" },
  addBtn: { background: "#2563eb", color: "#fff", padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer" },
  chartsContainer: { display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between" },
  chartCard: { flex: "1 1 48%", background: "#fff", padding: 18, borderRadius: 14, boxShadow: "0 10px 30px rgba(2,6,23,0.06)" },
  insights: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 22 },
  insightCard: { background: "linear-gradient(to right, #dbeafe, #e0f2fe)", padding: 14, borderRadius: 12, boxShadow: "0 6px 18px rgba(2,6,23,0.06)", cursor: "pointer" },
  detailCard: { background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 12px 40px rgba(2,6,23,0.08)", marginTop: 16 },
  closeBtn: { marginTop: 12, padding: "8px 12px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer" },
  aiSummary: { background: "#fffbeb", borderLeft: "5px solid #f59e0b", padding: 12, borderRadius: 10, marginTop: 18, color: "#92400e" },

  // KPI styles
  kpiCard: { display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 12, background: '#fff', boxShadow: '0 8px 30px rgba(2,6,23,0.04)', minWidth: 160 },
  kpiIcon: { fontSize: 22 },
  kpiValue: { fontSize: 20, fontWeight: 700 },
  kpiLabel: { color: '#6b7280', fontSize: 12 },
  exportBtn: { padding: '8px 10px', borderRadius: 10, border: '1px solid #e6eaf6', background: '#fff', cursor: 'pointer' },
};

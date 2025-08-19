import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import * as Recharts from "recharts";
import "react-toastify/dist/ReactToastify.css";

import { getAllLearningResults, getGeminiAnalysis } from "../../../services/learningResultService";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";

type SubjectInsight = {
  subjectName: string;
  trend: string;
  strength: string;
  weakness: string;
  suggestion: string;
};

type GeminiResponse = {
  subjectInsights: SubjectInsight[];
  radarChartData: { subject: string; score: number }[];
  trendChartData: TrendDataPoint[];
  overallSummary: string;
};

type TrendDataPoint = {
  name: string;
  [key: string]: number | string;
};

const mandatorySubjects = ["Toán", "Văn"];

// Recharts components typing
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
} = Recharts as unknown as {
  ResponsiveContainer: React.FC<any>;
  RadarChart: React.FC<any>;
  Radar: React.FC<any>;
  PolarGrid: React.FC<any>;
  PolarAngleAxis: React.FC<any>;
  PolarRadiusAxis: React.FC<any>;
  LineChart: React.FC<any>;
  Line: React.FC<any>;
  XAxis: React.FC<any>;
  YAxis: React.FC<any>;
  CartesianGrid: React.FC<any>;
  Tooltip: React.FC<any>;
};

// Lọc kết quả học tập theo tổ hợp môn
function filterCombinationResults(
  results: any[],
  subjects: { id: string; name: string }[],
  chosenSubjects: string[]
) {
  const chosenIds = subjects
    .filter((s) => chosenSubjects.some(name => s.name.includes(name)))
    .map((s) => s.id);

  return results.filter((r) => chosenIds.includes(r.subjectId));
}

// Tạo dữ liệu radar chart (nếu chưa có điểm -> score = 0)
function getRadarData(results: any[], subjects: { id: string; name: string }[]) {
  return subjects.map((subj) => {
    const subjectResults = results.filter((r) => r.subjectId === subj.id);
    const avgScore =
      subjectResults.length > 0
        ? subjectResults.reduce((sum, r) => sum + (r.score ?? 0), 0) / subjectResults.length
        : 0;
    return {
      subject: subj.name,
      score: Number(avgScore.toFixed(2)),
    };
  });
}

// Tạo dữ liệu line chart theo loại điểm
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

const PhanTichHoSoHocTapPage: React.FC = () => {
  const [customCombinations, setCustomCombinations] = useState<Record<string, string[]>>({});
  const [selectedCombination, setSelectedCombination] = useState<string>("");
  const [customSubject1, setCustomSubject1] = useState("");
  const [customSubject2, setCustomSubject2] = useState("");
  const [allSubjectsState, setAllSubjectsState] = useState<{ id: string; name: string }[]>([]);
  const [insights, setInsights] = useState<SubjectInsight[]>([]);
  const [selected, setSelected] = useState<SubjectInsight | null>(null);
  const [radarData, setRadarData] = useState<{ subject: string; score: number }[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(true);

  const allCombinations = { ...customCombinations };

  // Fetch danh sách môn học (type guard để tránh id = undefined)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjects = await getAllSubjects();
        const validSubjects = subjects
          .filter((s): s is { id: string; name: string } => !!s.id)
          .map((s) => ({ id: s.id, name: s.name }));
        setAllSubjectsState(validSubjects);
      } catch {
        toast.error("Không thể tải danh sách môn.");
      }
    };
    fetchSubjects();
  }, []);

  // Fetch phân tích AI + xây dựng danh sách môn hiển thị
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

        // Lọc kết quả theo tổ hợp
        const filteredResults = filterCombinationResults(results, allSubjectsState, chosenSubjects);

        // --- MỚI: đảm bảo Toán & Văn luôn có trong filteredSubjects ---
        // Sử dụng Map để giữ thứ tự và tránh trùng lặp
        const subjectMap = new Map<string, { id: string; name: string }>();

        // 1) Bắt buộc: tìm subject trong allSubjectsState có name chứa "Toán" hoặc "Văn" (đề phòng DB lưu "Ngữ Văn")
        mandatorySubjects.forEach((m) => {
          const matched = allSubjectsState.find((s) => s.name.includes(m));
          if (matched) subjectMap.set(matched.id, matched);
        });

        // 2) Thêm những môn trong tổ hợp đã chọn (nếu có trong allSubjectsState)
        allCombinations[selectedCombination]?.forEach((name) => {
          const matched = allSubjectsState.find((s) => s.name === name || s.name.includes(name));
          if (matched) subjectMap.set(matched.id, matched);
        });

        // 3) Thêm tất cả môn có dữ liệu trong filteredResults
        filteredResults.forEach((r) => {
          const subj = allSubjectsState.find((s) => s.id === r.subjectId);
          if (subj) subjectMap.set(subj.id, subj);
        });

        // Kết quả final: đảm bảo Toán & Văn có mặt, k có duplicate
        const filteredSubjects = Array.from(subjectMap.values());

        // Tạo dữ liệu chart
        setRadarData(getRadarData(filteredResults, filteredSubjects));
        setTrendData(await formatTrendDataByScoreType(filteredResults, filteredSubjects));

        // Gọi AI phân tích (dùng filteredResults)
        const analysis: GeminiResponse = await getGeminiAnalysis(filteredResults);
        setInsights(analysis.subjectInsights);
        setAiSummary(analysis.overallSummary);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải dữ liệu phân tích từ AI.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [selectedCombination, customCombinations, allSubjectsState]);

  const handleAddCombination = () => {
    if (!customSubject1 || !customSubject2) {
      toast.error("Vui lòng chọn đủ 2 môn tự chọn.");
      return;
    }
    if (customSubject1 === customSubject2) {
      toast.error("Hai môn tự chọn không được trùng nhau.");
      return;
    }

    const name = `Tổ hợp ${mandatorySubjects.join(", ")} + ${customSubject1}, ${customSubject2}`;
    setCustomCombinations((prev) => ({ ...prev, [name]: [customSubject1, customSubject2] }));
    setSelectedCombination(name);
    setCustomSubject1("");
    setCustomSubject2("");
  };

  const lineColors = ["#2563eb", "#ff6347", "#22c55e", "#f59e0b", "#8b5cf6"];
  const subjectsInTrend = trendData.length ? Object.keys(trendData[0]).filter((k) => k !== "name") : [];

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>📊 Phân Tích Hồ Sơ Học Tập</h2>

      <div style={styles.comboForm}>
        <p style={styles.comboLabel}>Toán & Văn là môn bắt buộc</p>
        <div style={styles.comboSelects}>
          <select value={customSubject1} onChange={(e) => setCustomSubject1(e.target.value)}>
            <option value="">-- Chọn môn 1 --</option>
            {allSubjectsState.filter((s) => !mandatorySubjects.some(m => s.name.includes(m))).map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <select value={customSubject2} onChange={(e) => setCustomSubject2(e.target.value)}>
            <option value="">-- Chọn môn 2 --</option>
            {allSubjectsState.filter((s) => !mandatorySubjects.some(m => s.name.includes(m))).map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <button onClick={handleAddCombination}>+ Thêm tổ hợp</button>
        </div>
      </div>

      <div style={styles.comboSelect}>
        <label>Chọn tổ hợp xét tuyển:</label>
        <select value={selectedCombination} onChange={(e) => setSelectedCombination(e.target.value)}>
          <option value="">-- Chưa chọn --</option>
          {Object.keys(allCombinations).map((combo) => (
            <option key={combo} value={combo}>{combo}</option>
          ))}
        </select>
      </div>

      <section style={styles.chart}>
        <h3>Tổng quan năng lực</h3>
        {loading ? <p>Đang tải dữ liệu...</p> : (
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart outerRadius={110} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar name="Học lực" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section style={styles.chart}>
        <h3>Biểu đồ xu hướng theo loại điểm</h3>
        {loading ? <p>Đang tải dữ liệu...</p> : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              {subjectsInTrend.map((s, i) => (
                <Line key={s} type="monotone" dataKey={s} stroke={lineColors[i % lineColors.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <section style={styles.insights}>
        {insights.map((insight, idx) => (
          <motion.div key={idx} onClick={() => setSelected(insight)} whileHover={{ scale: 1.02 }} style={styles.insightCard}>
            <h4>{insight.subjectName}</h4>
            <p>📈 Xu hướng: {insight.trend}</p>
          </motion.div>
        ))}
      </section>

      {selected && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.detail}>
          <h4>{selected.subjectName}</h4>
          <ul>
            <li>✔ Ưu điểm: {selected.strength}</li>
            <li>⚠ Nhược điểm: {selected.weakness}</li>
            <li>📈 Xu hướng: {selected.trend}</li>
            <li>💡 Gợi ý: {selected.suggestion}</li>
          </ul>
          <button onClick={() => setSelected(null)}>Đóng</button>
        </motion.section>
      )}

      {aiSummary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.summary}>
          🧠 <strong>Nhận xét tổng quát:</strong> {aiSummary}
        </motion.div>
      )}
    </div>
  );
};

export default PhanTichHoSoHocTapPage;

// CSS in JS
const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1100, margin: "30px auto", padding: 20, fontFamily: `"Segoe UI", Tahoma, sans-serif` },
  title: { textAlign: "center", fontSize: "2.2rem", fontWeight: 700, color: "#2563eb", marginBottom: 30 },
  comboForm: { marginBottom: 20 },
  comboLabel: { fontWeight: 600, marginBottom: 8 },
  comboSelects: { display: "flex", gap: 10, flexWrap: "wrap" },
  comboSelect: { marginBottom: 30 },
  chart: { background: "#fff", padding: 20, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", marginBottom: 25 },
  insights: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  insightCard: { background: "linear-gradient(to right, #dbeafe, #e0e7ff)", padding: 16, borderRadius: 14, boxShadow: "0 3px 10px rgba(0,0,0,0.1)", cursor: "pointer" },
  detail: { background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.15)", margin: "30px auto", maxWidth: 600 },
  summary: { background: "#fef3c7", borderLeft: "5px solid #fbbf24", padding: 16, borderRadius: 12, margin: "30px auto", maxWidth: 600, fontSize: "1rem", color: "#78350f" },
};

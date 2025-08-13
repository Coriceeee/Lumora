import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import * as Recharts from "recharts";

import { getAllLearningResults, getGeminiAnalysis } from "../../../services/learningResultService";
import { getAllSubjects } from "../../../services/subjectService";
import { LearningResult } from "../../../types/LearningResult";
import { Subject } from "../../../types/Subject";
import { getAllScoreTypes } from "../../../services/scoreTypeService";

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

// Môn bắt buộc
const mandatorySubjects = ["Toán", "Văn"];

// Lọc kết quả học tập theo tổ hợp môn
function filterCombinationResults(
  results: LearningResult[],
  subjects: { id: string; name: string }[],
  chosenSubjects: string[]
) {
  const chosenIds = subjects
    .filter((s) => chosenSubjects.some((name) => s.name.includes(name)))
    .map((s) => s.id);

  return results.filter((r) => chosenIds.includes(r.subjectId));
}

// Tạo dữ liệu radar chart: trung bình điểm từng môn
function getRadarData(
  results: LearningResult[],
  subjects: { id: string; name: string }[]
): { subject: string; score: number }[] {
  return subjects.map((subj) => {
    const subjectResults = results.filter((r) => r.subjectId === subj.id);
    const avgScore =
      subjectResults.reduce((sum, r) => sum + (r.score ?? 0), 0) /
      (subjectResults.length || 1);
    return {
      subject: subj.name,
      score: Number(avgScore.toFixed(2)),
    };
  });
}

// Hàm lấy điểm trung bình theo 3 loại điểm kttx, giuaki, cuoiki
async function formatTrendDataByScoreType(
  results: LearningResult[],
  subjects: { id: string; name: string }[]
): Promise<TrendDataPoint[]> {

  const scoreTypes = await getAllScoreTypes();

  return scoreTypes.map((scoreType) => {
    const dataPoint: TrendDataPoint = {
      name: scoreType.name
    };

    subjects.forEach((subject) => {
      const scoresForSubjectAndType = results
        .filter((r) => r.subjectId === subject.id && r.scoreTypeId === scoreType.id)
        .map((r) => (r as any)["score"])
        .filter((score) => typeof score === "number" && !isNaN(score)) as number[];

      const avgScore =
        scoresForSubjectAndType.reduce((sum, val) => sum + val, 0) /
        (scoresForSubjectAndType.length || 1);

      dataPoint[subject.name] = Number(avgScore.toFixed(2));
    });

    return dataPoint;
  });
}

const PhanTichNangLucPage: React.FC = () => {
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

  // Danh sách tổ hợp mặc định
  const defaultCombinations: Record<string, string[]> = {
  };

  // Kết hợp tổ hợp mặc định + tổ hợp do người dùng tạo
  const allCombinations = { ...defaultCombinations, ...customCombinations };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjects = await getAllSubjects();
        const safeSubjects = subjects
          .filter((s): s is Subject & { id: string } => typeof s.id === "string")
          .map((s) => ({ id: s.id, name: s.name }));
        setAllSubjectsState(safeSubjects);
      } catch (err) {
        toast.error("Không thể tải danh sách môn.");
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedCombination || !allCombinations[selectedCombination]) return;

      setLoading(true);
      try {
        const [results] = await Promise.all([getAllLearningResults()]);

        if (results.length === 0) {
          toast.info("Chưa có dữ liệu học tập để phân tích.");
          setLoading(false);
          return;
        }

        const chosenSubjects = [...mandatorySubjects, ...allCombinations[selectedCombination]];

        const filteredResults = filterCombinationResults(results, allSubjectsState, chosenSubjects);

        const filteredSubjects = allSubjectsState.filter((s) =>
          filteredResults.some((r) => r.subjectId === s.id)
        );

        const radar = getRadarData(filteredResults, filteredSubjects);
        const trend = await formatTrendDataByScoreType(filteredResults, filteredSubjects);

        setRadarData(radar);
        setTrendData(trend);

        const analysis: GeminiResponse = await getGeminiAnalysis(filteredResults);

        setInsights(analysis.subjectInsights);
        setAiSummary(analysis.overallSummary);
      } catch (error) {
        console.error(error);
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
    setCustomCombinations((prev) => ({
      ...prev,
      [name]: [customSubject1, customSubject2],
    }));
    setSelectedCombination(name);
    setCustomSubject1("");
    setCustomSubject2("");
  };

  const lineColors = ["#2563eb", "#ff6347", "#22c55e", "#f59e0b", "#8b5cf6"];
  const subjectsInTrend = trendData.length > 0
    ? Object.keys(trendData[0]).filter((k) => k !== "name")
    : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">📊 Phân Tích Hồ Sơ Học Tập</h2>

      {/* Form tạo tổ hợp */}
      <div className="mb-6 space-y-3">
        <p className="font-semibold">Toán & Văn là môn bắt buộc</p>
        <div className="flex gap-3">
          <select
            value={customSubject1}
            onChange={(e) => setCustomSubject1(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">-- Chọn môn 1 --</option>
            {allSubjectsState
              .filter((s) => !mandatorySubjects.some((m) => s.name.includes(m)))
              .map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
          </select>
          <select
            value={customSubject2}
            onChange={(e) => setCustomSubject2(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">-- Chọn môn 2 --</option>
            {allSubjectsState
              .filter((s) => !mandatorySubjects.some((m) => s.name.includes(m)))
              .map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
          </select>
          <button
            onClick={handleAddCombination}
            className="px-4 py-2 bg-green-600 text-black rounded hover:bg-green-700"
          >
            + Thêm tổ hợp
          </button>
        </div>
      </div>

      {/* Chọn tổ hợp đã lưu */}
      <div className="mb-6">
        <label className="mr-3 font-semibold">Chọn tổ hợp xét tuyển:</label>
        <select
          value={selectedCombination}
          onChange={(e) => setSelectedCombination(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Chưa chọn --</option>
          {Object.keys(allCombinations).map((combo) => (
            <option key={combo} value={combo}>
              {combo}
            </option>
          ))}
        </select>
      </div>

      {/* Radar Chart */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">Tổng quan năng lực</h3>
        {loading ? (
          <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
        ) : (
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

      {/* Line Chart */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">Biểu đồ xu hướng theo loại điểm</h3>
        {loading ? (
          <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              {subjectsInTrend.map((s, i) => (
                <Line
                  key={s}
                  type="monotone"
                  dataKey={s}
                  stroke={lineColors[i % lineColors.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Insights */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelected(insight)}
            className="cursor-pointer bg-gradient-to-r from-blue-100 to-blue-200 p-5 rounded-xl shadow"
          >
            <h4 className="font-semibold text-blue-800 text-lg">{insight.subjectName}</h4>
            <p className="text-sm italic text-gray-600 mt-1">📈 Xu hướng: {insight.trend}</p>
          </motion.div>
        ))}
      </section>

      {selected && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white mt-10 p-6 rounded-xl shadow max-w-3xl mx-auto"
        >
          <h4 className="text-2xl font-bold text-blue-700 mb-4">{selected.subjectName}</h4>
          <ul className="space-y-2 text-gray-700">
            <li>✔ Ưu điểm: {selected.strength}</li>
            <li>⚠ Nhược điểm: {selected.weakness}</li>
            <li>📈 Xu hướng: {selected.trend}</li>
            <li>💡 Gợi ý: {selected.suggestion}</li>
          </ul>
          <button
            onClick={() => setSelected(null)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Đóng
          </button>
        </motion.section>
      )}

      {aiSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl mt-10 max-w-3xl mx-auto"
        >
          <p className="text-lg text-gray-800">
            🧠 <strong>Nhận xét tổng quát:</strong> {aiSummary}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PhanTichNangLucPage;

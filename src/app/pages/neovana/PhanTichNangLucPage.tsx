import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import * as Recharts from "recharts";
import { getGeminiAnalysis } from "../../../services/geminiDashboardService";

// Fix TS types
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
} = Recharts as any;

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
  trendChartData: { name: string; [key: string]: number | string }[];
  overallSummary: string;
};

const PhanTichNangLucPage: React.FC = () => {
  // Khai báo các state ở cấp cao của component
  const [insights, setInsights] = useState<SubjectInsight[]>([]);
  const [selected, setSelected] = useState<SubjectInsight | null>(null);
  const [radarData, setRadarData] = useState<{ subject: string; score: number }[]>([]);
  const [trendData, setTrendData] = useState<{ name: string; [key: string]: number | string }[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: GeminiResponse = await getGeminiAnalysis();
        setInsights(res.subjectInsights);
        setRadarData(res.radarChartData);
        setTrendData(res.trendChartData);
        setAiSummary(res.overallSummary);
      } catch {
        toast.error("Không thể tải dữ liệu phân tích từ AI.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const lineColors = ["#2563eb", "#ff6347", "#22c55e", "#f59e0b", "#8b5cf6"];
  const subjects = trendData[0]
    ? Object.keys(trendData[0]).filter((k) => k !== "name")
    : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">📊 Phân Tích Năng Lực Học Tập</h2>

      {/* Biểu đồ radar */}
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

      {/* Biểu đồ xu hướng */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">Biểu đồ xu hướng theo thời gian</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            {subjects.map((s, i) => (
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
      </section>

      {/* Chi tiết môn */}
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

      {/* Chi tiết năng lực */}
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

      {/* Tổng kết */}
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

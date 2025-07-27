import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getAllLearningResults } from "../../../services/learningResultService";
import { Subject } from "../../../types/Subject";
import { ScoreType } from "../../../types/ScoreType";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";
import { LearningResult } from "../../../types/LearningResult";

export default function HoSoHocTapPage() {
  const [learningResults, setLearningResults] = useState<LearningResult[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [results, subs, types] = await Promise.all([
          getAllLearningResults(),
          getAllSubjects(),
          getAllScoreTypes(),
        ]);
        setLearningResults(results);
        setSubjects(subs);
        setScoreTypes(types);
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name || "Không rõ";

  const getScoreTypeName = (id: string) =>
    scoreTypes.find((t) => t.id === id)?.name || "Không rõ";

  const getSubjectIcon = (subjectName: string) => {
    if (subjectName.includes("Toán")) return "📐";
    if (subjectName.includes("Văn")) return "📖";
    if (subjectName.includes("Lý")) return "💡";
    if (subjectName.includes("Hóa")) return "⚗️";
    if (subjectName.includes("Sinh")) return "🌿";
    if (subjectName.includes("Anh")) return "🇬🇧";
    if (subjectName.includes("Tin")) return "💻";
    return "📘";
  };

  const filteredResults = learningResults.filter((r) => {
    const subjectName = getSubjectName(r.subjectId).toLowerCase();
    return subjectName.includes(search.toLowerCase());
  });

  return (
    <motion.div
      className="container py-10 text-black"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-4xl font-extrabold mb-6 text-center text-black drop-shadow-md">
        📘 Hồ Sơ Học Tập
      </h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Tìm môn học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full md:w-1/3 shadow-sm text-black"
        />
      </div>

      {loading ? (
        <p className="text-center italic text-black">Đang tải dữ liệu...</p>
      ) : filteredResults.length === 0 ? (
        <p className="text-center italic text-black">Không tìm thấy kết quả phù hợp.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl shadow-2xl border border-gray-200">
          <table className="min-w-full text-sm text-black">
            <thead className="bg-gradient-to-r from-indigo-100 via-sky-100 to-teal-100 text-black">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">📚 Lớp</th>
                <th className="px-6 py-4 text-left font-semibold">📖 Môn học</th>
                <th className="px-6 py-4 text-left font-semibold">📌 Loại điểm</th>
                <th className="px-6 py-4 text-left font-semibold">⭐ Điểm</th>
                <th className="px-6 py-4 text-left font-semibold">🕐 Học kỳ</th>
                <th className="px-6 py-4 text-left font-semibold">📅 Ngày học</th>
                <th className="px-6 py-4 text-left font-semibold">📝 Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, index) => (
                <tr
                  key={result.id}
                  className={`${
                    index % 2 === 0 ? "bg-gradient-to-r from-white to-gray-50" : "bg-white"
                  } hover:scale-[101%] transition duration-150 ease-in-out border-b border-gray-200`}
                >
                  <td className="px-6 py-4">{result.classLevel}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <span className="text-xl">
                      {getSubjectIcon(getSubjectName(result.subjectId))}
                    </span>
                    <span>{getSubjectName(result.subjectId)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full shadow-sm">
                      {getScoreTypeName(result.scoreTypeId)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-bold rounded-lg shadow-sm ${
                        result.score >= 8
                          ? "bg-green-100 text-green-700"
                          : result.score >= 5
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {result.score}{" "}
                      {result.score >= 8
                        ? "⭐"
                        : result.score >= 5
                        ? "⚠️"
                        : "❌"}
                    </span>
                  </td>
                  <td className="px-6 py-4">Học kỳ {result.semester}</td>
                  <td className="px-6 py-4 text-black">
                    {new Date(result.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 italic text-black">
                    {result.note ? "✏️ " + result.note : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer />
    </motion.div>
  );
}

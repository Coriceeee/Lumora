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

type GroupedRow = {
  subjectId: string;
  classLevel: number;
  semester: number;
  notes: string[];
  scoresByType: Record<string, LearningResult[]>;
};

const ScoreColorLegend = () => (
  <div className="mb-6 flex justify-center gap-6 flex-wrap text-sm select-none">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-green-700 rounded-md shadow-inner"></div>
      <span className="font-semibold text-green-700">≥ 8: Xuất sắc</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-yellow-700 rounded-md shadow-inner"></div>
      <span className="font-semibold text-yellow-700">5 - 7.9: Khá</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-red-500 rounded-md shadow-inner"></div>
      <span className="font-semibold text-red-500">3 - 4.9: Trung bình</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-red-700 rounded-md shadow-inner"></div>
      <span className="font-semibold text-red-700">＜ 3: Yếu kém</span>
    </div>
  </div>
);

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

  const getSubjectName = (id: string | undefined) =>
    subjects.find((s) => s.id === id)?.name || "Không rõ";

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

  const scoreTypeIcons: Record<string, string> = {
    kttx: "📝", // kiểm tra thường xuyên
    kt15p: "⏱️", // 15 phút
    kt1t: "🧪",  // 1 tiết
    giuaki: "📅", // giữa kỳ
    cuoiki: "🏁", // cuối kỳ
  };

  const filteredResults = learningResults.filter((r) => {
    const subjectName = getSubjectName(r.subjectId).toLowerCase();
    return subjectName.includes(search.toLowerCase());
  });

  const groupMap = new Map<string, GroupedRow>();

  filteredResults.forEach((r) => {
    const key = `${r.subjectId}-${r.classLevel}-${r.semester}`;
    const existing = groupMap.get(key);

    if (existing) {
      if (!existing.scoresByType[r.scoreTypeId ?? ""]) {
        existing.scoresByType[r.scoreTypeId ?? ""] = [];
      }
      existing.scoresByType[r.scoreTypeId ?? ""].push(r);
      if (r.note) existing.notes.push(r.note);
    } else {
      groupMap.set(key, {
        subjectId: r.subjectId ?? "",
        classLevel: r.classLevel,
        semester: r.semester,
        notes: r.note ? [r.note] : [],
        scoresByType: { [r.scoreTypeId ?? ""]: [r] },
      });
    }
  });

  const groupedRows = Array.from(groupMap.values());

  return (
    <motion.div
      className="container max-w-7xl mx-auto py-12 px-4 text-black select-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-4xl font-extrabold mb-4 text-center drop-shadow-md">
        📘 Hồ Sơ Học Tập
      </h2>

      <ScoreColorLegend />

      <div className="mb-8 flex justify-center">
        <input
          type="text"
          placeholder="🔍 Tìm môn học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 border border-gray-300 rounded-full w-full max-w-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          spellCheck={false}
        />
      </div>

      {loading ? (
        <p className="text-center italic text-gray-600 text-lg">Đang tải dữ liệu...</p>
      ) : groupedRows.length === 0 ? (
        <p className="text-center italic text-gray-600 text-lg">
          Không tìm thấy kết quả phù hợp.
        </p>
      ) : (
        <div className="space-y-12">
          {groupedRows.map((row, i) => {
            const subjectName = getSubjectName(row.subjectId);
            const subjectIcon = getSubjectIcon(subjectName);

            const allResultsForRow = Object.values(row.scoresByType).flat();
            const minDate = allResultsForRow.length
              ? allResultsForRow.reduce((min, r) => {
                  const d = new Date(r.date);
                  return d < min ? d : min;
                }, new Date(allResultsForRow[0].date))
              : null;

            return (
              <section
                key={`${row.subjectId}-${row.classLevel}-${row.semester}-${i}`}
                className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6"
              >
                <header className="flex items-center mb-6 gap-4">
                  <span className="text-5xl">{subjectIcon}</span>
                  <h3 className="text-3xl font-semibold text-gray-900">{subjectName}</h3>
                </header>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm font-medium text-gray-800 shadow-md rounded-xl border border-gray-300">
                    <thead className="bg-gradient-to-r from-indigo-200 via-sky-200 to-teal-200 text-gray-900">
                      <tr>
                        <th className="py-3 px-6 rounded-l-3xl">Lớp</th>
                        <th className="py-3 px-6">Học kỳ</th>
                        <th className="py-3 px-6">Ngày học</th>
                        <th className="py-3 px-6 rounded-r-3xl max-w-xs">Ghi chú</th>
                        {scoreTypes.map((type) =>
                          type.id ? (
                            <th
                              key={type.id}
                              className="py-3 px-6 text-center border-l border-gray-300"
                              title={type.description}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-xl">
                                  {scoreTypeIcons[type.id.toLowerCase()] ?? "📊"}
                                </span>
                                <span className="font-semibold">{type.name}</span>
                              </div>
                            </th>
                          ) : null
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white hover:bg-indigo-50 transition-colors duration-200 border-b border-gray-200">
                        <td className="py-4 px-6 font-semibold text-center align-top">
                          {row.classLevel}
                        </td>
                        <td className="py-4 px-6 text-center align-top">Học kỳ {row.semester}</td>
                        <td className="py-4 px-6 text-center align-top">
                          {minDate ? minDate.toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td className="py-4 px-6 italic text-gray-600 max-w-xs break-words align-top">
                          {row.notes.length > 0 ? row.notes.join("; ") : "—"}
                        </td>

                        {scoreTypes.map((type) => {
                          if (!type.id) return <td key="empty">—</td>;

                          const resultsForType = row.scoresByType[type.id] || [];

                          return (
                            <td
                              key={type.id}
                              className="py-4 px-6 align-top border-l border-gray-300 max-w-[120px]"
                            >
                              <div className="flex flex-col gap-1">
                                {resultsForType.length > 0 ? (
                                  resultsForType
                                    .sort(
                                      (a, b) =>
                                        new Date(a.date).getTime() - new Date(b.date).getTime()
                                    )
                                    .map((res, idx) => {
                                      let colorClass = "text-gray-400";
                                      if (res.score >= 8)
                                        colorClass = "text-green-700 font-bold";
                                      else if (res.score >= 5)
                                        colorClass = "text-yellow-700 font-semibold";
                                      else if (res.score < 3)
                                        colorClass = "text-red-700 font-bold";
                                      else colorClass = "text-red-500 font-semibold";

                                      return (
                                        <div
                                          key={idx}
                                          className={`text-center select-text ${colorClass} bg-white rounded-md shadow-sm px-2 py-1 cursor-default hover:scale-105 transition-transform duration-150 flex items-center justify-center gap-1`}
                                          title={`Điểm: ${res.score} - Ngày: ${new Date(
                                            res.date
                                          ).toLocaleDateString("vi-VN")}${
                                            res.score < 7 ? " ⚠️ Điểm thấp!" : ""
                                          }`}
                                        >
                                          <span>{res.score}</span>
                                          {res.score < 7 && (
                                            <span
                                              className="text-red-600"
                                              role="img"
                                              aria-label="warning"
                                            >
                                              ⚠️
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })
                                ) : (
                                  <div className="text-center text-gray-400 select-none">—</div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
}

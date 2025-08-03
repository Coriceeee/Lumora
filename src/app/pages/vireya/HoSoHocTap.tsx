import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getAllLearningResults, updateLearningResult, deleteLearningResult } from "../../../services/learningResultService";
import { Subject } from "../../../types/Subject";
import { ScoreType } from "../../../types/ScoreType";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";
import { LearningResult } from "../../../types/LearningResult";

import {
  BookOpen,
  Languages,
  Computer,
  Lightbulb,
  FlaskConical,
  NotebookPen,
  Timer,
  CalendarClock,
  Flag,
  TestTube2,
  Edit,
  Trash2,
  Save,
} from "lucide-react";

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
      <div className="w-6 h-6 bg-green-100 border border-green-700 rounded-md shadow-inner"></div>
      <span className="font-semibold text-green-700">≥ 8: Xuất sắc</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-yellow-100 border border-yellow-700 rounded-md shadow-inner"></div>
      <span className="font-semibold text-yellow-700">5 - 7.9: Khá</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-red-100 border border-red-600 rounded-md shadow-inner"></div>
      <span className="font-semibold text-red-600">3 - 4.9: Trung bình</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-red-200 border border-red-700 rounded-md shadow-inner"></div>
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

  // id môn đang bật chế độ edit (1 môn 1 lúc)
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  // map resultId => số điểm đang edit
  const [editedScores, setEditedScores] = useState<Record<string, number>>({});

  // map resultId => đang đánh dấu xóa
  const [deleteQueue, setDeleteQueue] = useState<Set<string>>(new Set());

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

  const getSubjectIcon = (subjectName: string) => {
    if (subjectName.includes("Toán")) return <BookOpen className="w-6 h-6 text-indigo-600" />;
    if (subjectName.includes("Văn")) return <NotebookPen className="w-6 h-6 text-pink-600" />;
    if (subjectName.includes("Lý")) return <Lightbulb className="w-6 h-6 text-yellow-500" />;
    if (subjectName.includes("Hóa")) return <FlaskConical className="w-6 h-6 text-purple-600" />;
    if (subjectName.includes("Sinh")) return <BookOpen className="w-6 h-6 text-green-600" />;
    if (subjectName.includes("Anh")) return <Languages className="w-6 h-6 text-blue-600" />;
    if (subjectName.includes("Tin")) return <Computer className="w-6 h-6 text-sky-600" />;
    return <BookOpen className="w-6 h-6 text-gray-600" />;
  };

  const scoreTypeIcons: Record<string, JSX.Element> = {
    kttx: <NotebookPen className="w-4 h-4" />,
    kt15p: <Timer className="w-4 h-4" />,
    kt1t: <TestTube2 className="w-4 h-4" />,
    giuaki: <CalendarClock className="w-4 h-4" />,
    cuoiki: <Flag className="w-4 h-4" />,
  };

  // cập nhật điểm của từng resultId
  const onScoreChange = (resultId: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setEditedScores((prev) => ({ ...prev, [resultId]: num }));
  };

  // lưu điểm đã chỉnh sửa
  const handleSaveEditedScores = async () => {
    if (!editingSubjectId) return;

    try {
      for (const [resultId, score] of Object.entries(editedScores)) {
        if (deleteQueue.has(resultId)) {
          await deleteLearningResult(resultId);
          toast.success("Xóa điểm thành công!");
        } else {
          await updateLearningResult(resultId, { score });
          toast.success("Cập nhật điểm thành công!");
        }
      }
      // tải lại dữ liệu
      const updated = await getAllLearningResults();
      setLearningResults(updated);
      setEditingSubjectId(null);
      setEditedScores({});
      setDeleteQueue(new Set());
    } catch (error) {
      toast.error("Lỗi khi cập nhật hoặc xóa điểm.");
    }
  };

  // bật/tắt chế độ edit cho 1 môn
  const toggleEditSubject = (subjectId: string) => {
    if (editingSubjectId === subjectId) {
      // đóng edit, reset
      setEditingSubjectId(null);
      setEditedScores({});
      setDeleteQueue(new Set());
    } else {
      // mở edit, lấy tất cả điểm của môn để preload
      const subjectResults = learningResults.filter((r) => r.subjectId === subjectId);
      const scoresMap: Record<string, number> = {};
      subjectResults.forEach((r) => {
        if (r.id) scoresMap[r.id] = r.score;
      });
      setEditingSubjectId(subjectId);
      setEditedScores(scoresMap);
      setDeleteQueue(new Set());
    }
  };

  // đánh dấu/unmark xóa điểm
  const toggleDeleteScore = (resultId: string) => {
    setDeleteQueue((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) newSet.delete(resultId);
      else newSet.add(resultId);
      return newSet;
    });
  };

  // lọc kết quả theo search
  const filteredResults = learningResults.filter((r) => {
    const subjectName = getSubjectName(r.subjectId ?? "");
    return subjectName.toLowerCase().includes(search.toLowerCase());
  });

  // gom nhóm theo môn, lớp, học kỳ
  const groupMap = new Map<string, GroupedRow>();
  filteredResults.forEach((r) => {
    const subjectId = r.subjectId ?? "";
    const key = `${subjectId}-${r.classLevel}-${r.semester}`;
    const existing = groupMap.get(key);

    if (existing) {
      if (!existing.scoresByType[r.scoreTypeId ?? ""]) {
        existing.scoresByType[r.scoreTypeId ?? ""] = [];
      }
      existing.scoresByType[r.scoreTypeId ?? ""].push(r);
      if (r.note) existing.notes.push(r.note);
    } else {
      groupMap.set(key, {
        subjectId,
        classLevel: r.classLevel,
        semester: r.semester,
        notes: r.note ? [r.note] : [],
        scoresByType: { [r.scoreTypeId ?? ""]: [r] },
      });
    }
  });

  const groupedRows = Array.from(groupMap.values());
  const sortedScoreTypes = [...scoreTypes].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));

  return (
    <motion.div
      className="container max-w-7xl mx-auto py-12 px-4 text-black select-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-4xl font-extrabold mb-4 text-center drop-shadow-md">
        <BookOpen className="inline-block w-8 h-8 mr-2 text-indigo-600" />
        Hồ Sơ Học Tập
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
        <p className="text-center italic text-gray-600 text-lg">Không tìm thấy kết quả phù hợp.</p>
      ) : (
        <div className="space-y-12">
          {groupedRows.map((row, i) => {
            const subjectName = getSubjectName(row.subjectId);
            const subjectIcon = getSubjectIcon(subjectName);
            const allResults = Object.values(row.scoresByType).flat();
            const minDate = allResults.length
              ? allResults.reduce((min, r) => new Date(r.date) < min ? new Date(r.date) : min, new Date(allResults[0].date))
              : null;

            const isEditingSubject = editingSubjectId === row.subjectId;

            return (
              <section key={`${row.subjectId}-${row.classLevel}-${row.semester}-${i}`} className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
                <header className="flex items-center mb-6 gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{subjectIcon}</div>
                    <h3 className="text-3xl font-semibold text-gray-900">{subjectName}</h3>
                  </div>
                  <button
                    onClick={() => toggleEditSubject(row.subjectId)}
                    className={`flex items-center gap-1 text-indigo-700 hover:text-indigo-900 font-semibold select-none`}
                    title={isEditingSubject ? "Hủy chỉnh sửa" : "Chỉnh sửa điểm môn này"}
                  >
                    <Edit size={20} />
                    <span>{isEditingSubject ? "Hủy" : "Sửa điểm"}</span>
                  </button>
                </header>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm font-medium text-gray-800 shadow-md rounded-xl border border-gray-300">
                    <thead className="bg-gradient-to-r from-indigo-200 via-sky-200 to-teal-200 text-gray-900">
                      <tr>
                        <th className="py-3 px-6 rounded-l-3xl">Lớp</th>
                        <th className="py-3 px-6">Học kỳ</th>
                        <th className="py-3 px-6">Ngày học</th>
                        <th className="py-3 px-6 rounded-r-3xl max-w-xs">Ghi chú</th>
                        {sortedScoreTypes.map((type) =>
                          type.id ? (
                            <th
                              key={type.id}
                              className="py-3 px-6 text-center border-l border-gray-300"
                              title={type.description}
                            >
                              <div className="flex items-center justify-center gap-2">
                                {scoreTypeIcons[type.id.toLowerCase()] ?? "📊"}
                                <span className="font-semibold">{type.name}</span>
                              </div>
                            </th>
                          ) : null
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white hover:bg-indigo-50 transition-colors duration-200 border-b border-gray-200">
                        <td className="py-4 px-6 font-semibold text-center align-top">{row.classLevel}</td>
                        <td className="py-4 px-6 text-center align-top">Học kỳ {row.semester}</td>
                        <td className="py-4 px-6 text-center align-top">
                          {minDate ? minDate.toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td className="py-4 px-6 italic text-gray-600 max-w-xs break-words align-top">
                          {row.notes.length > 0 ? row.notes.join("; ") : "—"}
                        </td>
                        {sortedScoreTypes.map((type) => {
                          const results = type.id ? row.scoresByType[type.id] || [] : [];

                          return (
                            <td
                              key={type.id}
                              className="py-4 px-6 align-top border-l border-gray-300 max-w-[120px]"
                            >
                              <div className="flex flex-col gap-1">
                                {results.length > 0 ? (
                                  results
                                    .sort(
                                      (a, b) =>
                                        new Date(a.date).getTime() -
                                        new Date(b.date).getTime()
                                    )
                                    .map((res) => {
                                      const isDeleted = deleteQueue.has(res.id ?? "");
                                      const isEditing = isEditingSubject && res.id !== undefined;

                                      // màu nền điểm
                                      const scoreBoxStyle =
                                        (editedScores[res.id ?? ""] ?? res.score) >= 8
                                          ? "bg-green-100 text-green-800 font-semibold"
                                          : (editedScores[res.id ?? ""] ?? res.score) >= 5
                                          ? "bg-yellow-100 text-yellow-800 font-medium"
                                          : (editedScores[res.id ?? ""] ?? res.score) >= 3
                                          ? "bg-red-100 text-red-600 font-medium"
                                          : "bg-red-200 text-red-800 font-bold";

                                      return (
                                        <div
                                          key={res.id}
                                          className={`relative text-center rounded-xl px-2 py-1 shadow-inner flex items-center justify-center gap-1 transition-transform duration-150 ${
                                            scoreBoxStyle
                                          } ${isDeleted ? "opacity-40 line-through" : ""}`}
                                          title={`Điểm: ${editedScores[res.id ?? ""] ?? res.score} • Ngày: ${new Date(res.date).toLocaleDateString("vi-VN")}${
                                            (editedScores[res.id ?? ""] ?? res.score) < 5
                                              ? " ⚠️ Cần cải thiện"
                                              : ""
                                          }`}
                                        >
                                          {isEditing ? (
                                            <>
                                              <input
                                                type="number"
                                                step="0.1"
                                                min={0}
                                                max={10}
                                                className="w-14 text-center rounded-md border border-gray-300 text-sm px-1 py-0.5"
                                                value={editedScores[res.id ?? ""] ?? res.score}
                                                onChange={(e) =>
                                                  onScoreChange(res.id ?? "", e.target.value)
                                                }
                                                disabled={isDeleted}
                                              />
                                              {isDeleted ? (
                                                <button
                                                  onClick={() =>
                                                    toggleDeleteScore(res.id ?? "")
                                                  }
                                                  title="Hoàn tác xóa"
                                                  className="text-yellow-700 hover:text-yellow-900"
                                                  type="button"
                                                >
                                                  ↩️
                                                </button>
                                              ) : (
                                                <button
                                                  onClick={() =>
                                                    toggleDeleteScore(res.id ?? "")
                                                  }
                                                  title="Xóa điểm"
                                                  className="text-red-700 hover:text-red-900"
                                                  type="button"
                                                >
                                                  <Trash2 size={16} />
                                                </button>
                                              )}
                                            </>
                                          ) : (
                                            <>
                                              <span>{editedScores[res.id ?? ""] ?? res.score}</span>
                                              {(editedScores[res.id ?? ""] ?? res.score) < 5 && (
                                                <span className="text-red-600">⚠️</span>
                                              )}
                                            </>
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

                {isEditingSubject && (
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={handleSaveEditedScores}
                      className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition select-none"
                    >
                      <Save size={18} />
                      Lưu thay đổi
                    </button>
                    <button
                      onClick={() => toggleEditSubject(row.subjectId)}
                      className="flex items-center gap-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition select-none"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
}

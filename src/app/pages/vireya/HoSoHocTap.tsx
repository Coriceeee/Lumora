import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getAllLearningResults,
  updateLearningResult,
  deleteLearningResult,
} from "../../../services/learningResultService";
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

const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "1rem",
  },

  heading: {
    fontSize: "2.5rem",
    fontWeight: "800",
    textAlign: "center" as const,
    marginBottom: "1.5rem",
    textShadow: "0 2px 4px rgb(0 0 0 / 0.1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
  },

  scoreLegend: {
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    flexWrap: "wrap" as const,
    marginBottom: "2rem",
    fontSize: "0.875rem",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
    borderWidth: 1,
    borderStyle: "solid",
  },

  searchWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "2rem",
  },

  searchInput: {
    width: "100%",
    maxWidth: 360,
    padding: "0.75rem 1rem",
    borderRadius: 9999,
    border: "1.5px solid #ccc",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.3s",
  },

  searchInputFocus: {
    borderColor: "#6366F1",
    boxShadow: "0 0 6px #6366F1",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 24,
    boxShadow: "0 6px 15px rgb(0 0 0 / 0.1)",
    border: "1px solid #ddd",
    padding: "1.5rem 2rem",
    marginBottom: "3rem",
  },

  headerFlex: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  subjectIcon: {
    fontSize: "3rem",
    color: "#4f46e5", // Indigo
  },

  subjectName: {
    fontSize: "1.75rem",
    fontWeight: 600,
    color: "#111",
  },

  editButton: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 600,
    color: "#4338ca",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "0.25rem 0.5rem",
    borderRadius: 6,
    transition: "color 0.3s",
  },

  editButtonHover: {
    color: "#312e81",
  },

  table: {
    width: "100%",
    borderCollapse: "separate" as const,
    borderSpacing: "0 12px",
    fontSize: "0.9rem",
    color: "#444",
  },

  thead: {
    background: "linear-gradient(90deg, #a5b4fc, #38bdf8, #14b8a6)",
    color: "#1e293b",
  },

  th: {
    padding: "12px 18px",
    fontWeight: 600,
    textAlign: "center" as const,
    userSelect: "none" as const,
    borderLeft: "1px solid #cbd5e1",
  },

  thLeft: {
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderLeft: "none",
  },

  thRight: {
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },

  tbodyRow: {
    backgroundColor: "#fff",
    borderRadius: 20,
    boxShadow: "0 3px 6px rgb(0 0 0 / 0.05)",
    transition: "background-color 0.2s",
  },

  tbodyRowHover: {
    backgroundColor: "#eef2ff",
  },

  // Chỉ khai báo 1 lần td duy nhất, không trùng
  td: {
    padding: "12px 16px",
    verticalAlign: "top" as const,
    borderLeft: "1px solid #cbd5e1",
    textAlign: "center" as const,
    maxWidth: 140,
    wordBreak: "break-word" as const,
    userSelect: "none" as const,
  },

  tdLeft: {
    textAlign: "center" as const,
    fontWeight: 600,
    borderLeft: "none",
  },

  notesCell: {
    fontStyle: "italic",
    color: "#6b7280",
    maxWidth: 320,
  },

  scoreBox: {
    borderRadius: 12,
    padding: "4px 8px",
    boxShadow: "inset 0 0 6px rgb(0 0 0 / 0.1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    fontWeight: 600,
  },

  scoreInput: {
    width: 56,
    padding: "2px 6px",
    borderRadius: 6,
    border: "1.5px solid #cbd5e1",
    fontSize: "0.9rem",
    textAlign: "center" as const,
  },

  scoreDeleteBtn: {
    background: "none",
    border: "none",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: 18,
    display: "flex",
    alignItems: "center",
  },

  scoreUndoBtn: {
    background: "none",
    border: "none",
    color: "#ca8a04",
    cursor: "pointer",
    fontSize: 18,
    display: "flex",
    alignItems: "center",
  },

  warningIcon: {
    color: "#b91c1c",
    fontWeight: 700,
  },

  actionButtonsWrapper: {
    marginTop: "1.5rem",
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
  },

  saveBtn: {
    backgroundColor: "#16a34a",
    color: "#000",
    fontWeight: 700,
    padding: "0.5rem 1.25rem",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "background-color 0.3s",
  },

  saveBtnHover: {
    backgroundColor: "#15803d",
  },

  cancelBtn: {
    backgroundColor: "#d1d5db",
    padding: "0.5rem 1.25rem",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
};

// Legend màu điểm
const ScoreColorLegend = () => (
  <div style={styles.scoreLegend}>
    <div style={styles.legendItem}>
      <div
        style={{
          ...styles.legendBox,
          backgroundColor: "#d1fae5",
          borderColor: "#15803d",
        }}
      />
      <span style={{ fontWeight: 600, color: "#15803d" }}>≥ 8: Xuất sắc</span>
    </div>
    <div style={styles.legendItem}>
      <div
        style={{
          ...styles.legendBox,
          backgroundColor: "#fef3c7",
          borderColor: "#a16207",
        }}
      />
      <span style={{ fontWeight: 600, color: "#a16207" }}>5 - 7.9: Khá</span>
    </div>
    <div style={styles.legendItem}>
      <div
        style={{
          ...styles.legendBox,
          backgroundColor: "#fee2e2",
          borderColor: "#dc2626",
        }}
      />
      <span style={{ fontWeight: 600, color: "#dc2626" }}>3 - 4.9: Trung bình</span>
    </div>
    <div style={styles.legendItem}>
      <div
        style={{
          ...styles.legendBox,
          backgroundColor: "#fecaca",
          borderColor: "#991b1b",
        }}
      />
      <span style={{ fontWeight: 600, color: "#991b1b" }}>＜ 3: Yếu kém</span>
    </div>
  </div>
);

// Helper lấy style màu chữ theo điểm
function getScoreTextStyle(score?: number): React.CSSProperties {
  if (score === undefined || score === null) return {};
  if (score < 3) return { color: "#991b1b", fontWeight: 700 };
  if (score < 5) return { color: "#ef4444", fontWeight: 600 };
  if (score < 8) return { color: "#a16207", fontWeight: 600 };
  return { color: "#166534", fontWeight: 700 };
}


export default function HoSoHocTapPage() {
  const [learningResults, setLearningResults] = useState<LearningResult[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editedScores, setEditedScores] = useState<Record<string, number>>({});
  const [deleteQueue, setDeleteQueue] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const [results, subs, types] = await Promise.all([
          getAllLearningResults(),
          getAllSubjects(),
          getAllScoreTypes(),
        ]);
        setLearningResults(results);
        setSubjects(subs);
        setScoreTypes(types);
      } catch {
        toast.error("Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name || "Không rõ";

  const getSubjectIcon = (subjectName: string) => {
    if (subjectName.includes("Toán"))
      return <BookOpen style={{ color: "#4338ca", fontSize: 36 }} />;
    if (subjectName.includes("Văn"))
      return <NotebookPen style={{ color: "#db2777", fontSize: 36 }} />;
    if (subjectName.includes("Lý"))
      return <Lightbulb style={{ color: "#eab308", fontSize: 36 }} />;
    if (subjectName.includes("Hóa"))
      return <FlaskConical style={{ color: "#7c3aed", fontSize: 36 }} />;
    if (subjectName.includes("Sinh"))
      return <BookOpen style={{ color: "#15803d", fontSize: 36 }} />;
    if (subjectName.includes("Anh"))
      return <Languages style={{ color: "#2563eb", fontSize: 36 }} />;
    if (subjectName.includes("Tin"))
      return <Computer style={{ color: "#0ea5e9", fontSize: 36 }} />;
    return <BookOpen style={{ color: "#6b7280", fontSize: 36 }} />;
  };

  const scoreTypeIcons: Record<string, JSX.Element> = {
    kttx: <NotebookPen style={{ width: 16, height: 16 }} />,
    kt15p: <Timer style={{ width: 16, height: 16 }} />,
    kt1t: <TestTube2 style={{ width: 16, height: 16 }} />,
    giuaki: <CalendarClock style={{ width: 16, height: 16 }} />,
    cuoiki: <Flag style={{ width: 16, height: 16 }} />,
  };

  const onScoreChange = (resultId: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setEditedScores((prev) => ({ ...prev, [resultId]: num }));
  };

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
      const updated = await getAllLearningResults();
      setLearningResults(updated);
      setEditingSubjectId(null);
      setEditedScores({});
      setDeleteQueue(new Set());
    } catch {
      toast.error("Lỗi khi cập nhật hoặc xóa điểm.");
    }
  };

  const toggleEditSubject = (subjectId: string) => {
    if (editingSubjectId === subjectId) {
      setEditingSubjectId(null);
      setEditedScores({});
      setDeleteQueue(new Set());
    } else {
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

  const toggleDeleteScore = (resultId: string) => {
    setDeleteQueue((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) newSet.delete(resultId);
      else newSet.add(resultId);
      return newSet;
    });
  };

  const filteredResults = learningResults.filter((r) => {
    const subjectName = getSubjectName(r.subjectId ?? "");
    return subjectName.toLowerCase().includes(search.toLowerCase());
  });

  // Nhóm theo subject + classLevel + semester
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
    <motion.div style={styles.container} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={styles.heading}>
        <BookOpen style={{ fontSize: 32, color: "#4338ca" }} />
        Hồ Sơ Học Tập
      </h2>

      {/* Giữ nguyên ScoreColorLegend nếu bạn có, hoặc xoá dòng dưới nếu không */}
      <ScoreColorLegend />

      <div style={styles.searchWrapper}>
        <input
          type="text"
          placeholder="🔍 Tìm môn học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
          spellCheck={false}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#6366F1")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: "center", fontStyle: "italic", color: "#555", fontSize: 18 }}>
          Đang tải dữ liệu...
        </p>
      ) : groupedRows.length === 0 ? (
        <p style={{ textAlign: "center", fontStyle: "italic", color: "#555", fontSize: 18 }}>
          Không tìm thấy kết quả phù hợp.
        </p>
      ) : (
        groupedRows.map((row, i) => {
          const subjectName = getSubjectName(row.subjectId);
          const subjectIcon = getSubjectIcon(subjectName);
          const allResults = Object.values(row.scoresByType).flat();
          const minDate = allResults.length
            ? allResults.reduce(
                (min, r) => (new Date(r.date) < min ? new Date(r.date) : min),
                new Date(allResults[0].date)
              )
            : null;
          const isEditingSubject = editingSubjectId === row.subjectId;

          return (
            <section
              key={`${row.subjectId}-${row.classLevel}-${i}`}
              style={styles.section}
            >
              <header style={styles.headerFlex}>
                <div style={styles.headerLeft}>
                  <div style={styles.subjectIcon}>{subjectIcon}</div>
                  <h3 style={styles.subjectName}>{subjectName}</h3>
                </div>
                <button
                  onClick={() => toggleEditSubject(row.subjectId)}
                  style={styles.editButton}
                  title={isEditingSubject ? "Hủy chỉnh sửa" : "Chỉnh sửa điểm môn này"}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#312e81")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#4338ca")}
                >
                  <Edit size={20} />
                  <span>{isEditingSubject ? "Hủy" : "Sửa điểm"}</span>
                </button>
              </header>

              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead style={styles.thead}>
                    <tr>
                      <th style={{ ...styles.th, ...styles.thLeft }}>Lớp</th>
                      <th style={styles.th}>Học kỳ</th> {/* ✅ Thêm cột học kỳ */}
                      <th style={styles.th}>Ngày học</th>
                      <th style={{ ...styles.th, ...styles.notesCell }}>Ghi chú</th>
                      {sortedScoreTypes.map((type) =>
                        type.id ? (
                          <th
                            key={type.id}
                            style={styles.th}
                            title={type.description}
                            aria-label={type.name}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 6,
                                alignItems: "center",
                              }}
                            >
                              {scoreTypeIcons[type.id.toLowerCase()] ?? "📊"}
                              <span style={{ fontWeight: 600 }}>{type.name}</span>
                            </div>
                          </th>
                        ) : null
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      style={styles.tbodyRow}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "#eef2ff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "#fff";
                      }}
                    >
                      <td style={{ ...styles.td, ...styles.tdLeft }}>{row.classLevel}</td>
                      <td style={styles.td}>{row.semester}</td> {/* ✅ Hiển thị học kỳ */}
                      <td style={styles.td}>{minDate ? minDate.toLocaleDateString("vi-VN") : "—"}</td>
                      <td style={{ ...styles.td, ...styles.notesCell }}>
                        {row.notes.length > 0 ? row.notes.join("; ") : "—"}
                      </td>

                      {sortedScoreTypes.map((type) => {
                        const results = type.id ? row.scoresByType[type.id] || [] : [];

                        return (
                          <td
                            key={type.id}
                            style={{ ...styles.td, maxWidth: 140, borderLeft: "1px solid #cbd5e1" }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {results.length > 0 ? (
                                results
                                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                  .map((res) => {
                                    const isDeleted = deleteQueue.has(res.id ?? "");
                                    const isEditing = isEditingSubject && res.id !== undefined;
                                    const scoreValue = editedScores[res.id ?? ""] ?? res.score;

                                    let bgColor = "#fee2e2";
                                    let fontWeight = 600;

                                    if (scoreValue >= 8) {
                                      bgColor = "#d1fae5";
                                      fontWeight = 700;
                                    } else if (scoreValue >= 5) {
                                      bgColor = "#fef3c7";
                                      fontWeight = 600;
                                    } else if (scoreValue >= 3) {
                                      bgColor = "#fee2e2";
                                      fontWeight = 600;
                                    } else {
                                      bgColor = "#fecaca";
                                      fontWeight = 700;
                                    }

                                    return (
                                      <div
                                        key={res.id}
                                        style={{
                                          ...styles.scoreBox,
                                          backgroundColor: bgColor,
                                          opacity: isDeleted ? 0.5 : 1,
                                          textDecoration: isDeleted ? "line-through" : "none",
                                          cursor: isEditing ? "default" : "auto",
                                        }}
                                        title={`Điểm: ${scoreValue} • Ngày: ${new Date(
                                          res.date
                                        ).toLocaleDateString("vi-VN")}$ {
                                          scoreValue < 5 ? " ⚠️ Cần cải thiện" : ""
                                        }`}
                                      >
                                        {isEditing ? (
                                          <>
                                            <input
                                              type="number"
                                              step={0.1}
                                              min={0}
                                              max={10}
                                              style={styles.scoreInput}
                                              value={scoreValue}
                                              onChange={(e) => onScoreChange(res.id ?? "", e.target.value)}
                                              disabled={isDeleted}
                                            />
                                            {isDeleted ? (
                                              <button
                                                onClick={() => toggleDeleteScore(res.id ?? "")}
                                                title="Hoàn tác xóa"
                                                style={styles.scoreUndoBtn}
                                                type="button"
                                              >
                                                ↩️
                                              </button>
                                            ) : (
                                              <button
                                                onClick={() => toggleDeleteScore(res.id ?? "")}
                                                title="Xóa điểm"
                                                style={styles.scoreDeleteBtn}
                                                type="button"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            )}
                                          </>
                                        ) : (
                                          <>
                                            <span style={{ fontWeight }}>{scoreValue}</span>
                                            {scoreValue < 5 && <span style={styles.warningIcon}>⚠️</span>}
                                          </>
                                        )}
                                      </div>
                                    );
                                  })
                              ) : (
                                <div
                                  style={{ color: "#9ca3af", textAlign: "center", userSelect: "none" }}
                                >
                                  —
                                </div>
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
                <div style={styles.actionButtonsWrapper}>
                  <button
                    onClick={handleSaveEditedScores}
                    style={styles.saveBtn}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#15803d")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#16a34a")}
                  >
                    <Save size={18} />
                    Lưu thay đổi
                  </button>
                  <button onClick={() => toggleEditSubject(row.subjectId)} style={styles.cancelBtn}>
                    Hủy
                  </button>
                </div>
              )}
            </section>
          );
        })
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
}

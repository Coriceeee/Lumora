import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "../../../utils/fakeMotion";
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
import { useFirebaseUser } from "../../hooks/useFirebaseUser";

import {
  BookOpen,
  Languages,
  Computer,
  Lightbulb,
  NotebookPen,
  Timer,
  CalendarClock,
  Flag,
  TestTube2,
  Edit,
  Trash2,
  Save,
} from "lucide-react";

/* ---------- types ---------- */
type SemesterRow = {
  semester: number;
  notes: string[];
  scoresByType: Record<string, LearningResult[]>;
};

type GroupedRow = {
  subjectId: string;
  classLevel: number;
  semesters: SemesterRow[];
};

/* ---------- styles ---------- */
const styles = {
  container: { maxWidth: 1200, margin: "0 auto", padding: "1rem" },
  heading: {
    fontSize: "2.5rem",
    fontWeight: "800",
    textAlign: "center" as const,
    marginBottom: "1.5rem",
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
  legendItem: { display: "flex", alignItems: "center", gap: "0.5rem" },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
    borderWidth: 1,
    borderStyle: "solid",
  },
  searchWrapper: { display: "flex", justifyContent: "center", marginBottom: "2rem" },
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
  section: {
    backgroundColor: "#fff",
    borderRadius: 24,
    boxShadow: "0 6px 15px rgb(0 0 0 / 0.1)",
    border: "1px solid #ddd",
    padding: "1.5rem 2rem",
    marginBottom: "3rem",
  },
  headerFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  headerLeft: { display: "flex", alignItems: "center", gap: "1rem" },
  subjectName: { fontSize: "1.75rem", fontWeight: 600, color: "#111" },
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
  },
  table: { width: "100%", borderCollapse: "separate" as const, borderSpacing: "0 12px", fontSize: "0.9rem", color: "#444" },
  thead: { background: "linear-gradient(90deg, #a5b4fc, #38bdf8, #14b8a6)", color: "#1e293b" },
  th: { padding: "12px 18px", fontWeight: 600, textAlign: "center" as const },
  tbodyRow: { backgroundColor: "#fff", borderRadius: 20, transition: "background-color 0.2s" },
  td: { padding: "12px 16px", textAlign: "center" as const },
  notesCell: { fontStyle: "italic", color: "#6b7280" },
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
  scoreInput: { width: 56, padding: "2px 6px", borderRadius: 6, border: "1.5px solid #cbd5e1", textAlign: "center" as const },
  scoreDeleteBtn: { background: "none", border: "none", color: "#dc2626", cursor: "pointer" },
  scoreUndoBtn: { background: "none", border: "none", color: "#ca8a04", cursor: "pointer" },
  warningIcon: { color: "#b91c1c", fontWeight: 700 },
  actionButtonsWrapper: { marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "1rem" },
  saveBtn: { backgroundColor: "#16a34a", color: "#fff", fontWeight: 700, padding: "0.5rem 1.25rem", borderRadius: 12, border: "none" },
  cancelBtn: { backgroundColor: "#d1d5db", padding: "0.5rem 1.25rem", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600 },
};

/* ---------- helper ---------- */
const getSubjectIcon = (subjectName: string) => {
  const name = (subjectName ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (name.includes("toan") || name.includes("math")) return <BookOpen style={{ color: "#4338ca", fontSize: 36 }} />;
  if (name.includes("anh")) return <Languages style={{ color: "#2563eb", fontSize: 36 }} />;
  if (name.includes("ly")) return <Lightbulb style={{ color: "#eab308", fontSize: 36 }} />;
  if (name.includes("sinh")) return <TestTube2 style={{ color: "#15803d", fontSize: 36 }} />;
  if (name.includes("tin")) return <Computer style={{ color: "#0ea5e9", fontSize: 36 }} />;
  return <BookOpen style={{ color: "#6b7280", fontSize: 36 }} />;
};

/* ---------- main component ---------- */
export default function HoSoHocTapPage() {
  const [learningResults, setLearningResults] = useState<LearningResult[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editedScores, setEditedScores] = useState<Record<string, number>>({});
  const [deleteQueue, setDeleteQueue] = useState<Set<string>>(new Set());

  const { userId, loading: authLoading } = useFirebaseUser(); // ✅ đổi tên để tránh trùng

  useEffect(() => {
    if (authLoading) return; // ⏳ chờ Firebase Auth
    if (!userId) {
      console.warn("❌ Không có user đăng nhập, bỏ qua tải dữ liệu.");
      return;
    }

    (async () => {
      try {
        const [results, subs, types] = await Promise.all([
          getAllLearningResults(userId),
          getAllSubjects(),
          getAllScoreTypes(),
        ]);
        setLearningResults(results);
        setSubjects(subs);
        setScoreTypes(types);
      } catch (error) {
        console.error(error);
        toast.error("Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, authLoading]);

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "Không rõ";

  const scoreTypeIcons: Record<string, JSX.Element> = {
    kttx: <NotebookPen size={16} />,
    kt15p: <Timer size={16} />,
    kt1t: <TestTube2 size={16} />,
    giuaki: <CalendarClock size={16} />,
    cuoiki: <Flag size={16} />,
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
        if (deleteQueue.has(resultId)) await deleteLearningResult(resultId);
        else await updateLearningResult(resultId, { score });
      }
      toast.success("Cập nhật/xóa điểm thành công!");
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
      newSet.has(resultId) ? newSet.delete(resultId) : newSet.add(resultId);
      return newSet;
    });
  };

  const getScoreColor = (score: number) => {
    if (score < 5) return '#f8d7da'; // Weak (pastel red)
    if (score < 7) return '#fef2c0'; // Average (pastel yellow)
    if (score < 9) return '#cce4f7'; // Good (pastel blue)
    return '#c9f7d5'; // High (pastel green)
  };

  const filteredResults = learningResults.filter((r) => {
    const subjectName = getSubjectName(r.subjectId ?? "");
    return subjectName.toLowerCase().includes(search.toLowerCase());
  });

  const groupMap = new Map<string, GroupedRow>();
  filteredResults.forEach((r) => {
    const subjectId = r.subjectId ?? "";
    const key = `${subjectId}-${r.classLevel}`;
    const existing = groupMap.get(key);
    if (!existing) {
      const semRow: SemesterRow = {
        semester: r.semester,
        notes: r.note ? [r.note] : [],
        scoresByType: { [r.scoreTypeId ?? ""]: [r] },
      };
      groupMap.set(key, { subjectId, classLevel: r.classLevel, semesters: [semRow] });
    } else {
      let sem = existing.semesters.find((s) => s.semester === r.semester);
      if (!sem) {
        sem = { semester: r.semester, notes: r.note ? [r.note] : [], scoresByType: { [r.scoreTypeId ?? ""]: [r] } };
        existing.semesters.push(sem);
      } else {
        if (!sem.scoresByType[r.scoreTypeId ?? ""]) sem.scoresByType[r.scoreTypeId ?? ""] = [];
        sem.scoresByType[r.scoreTypeId ?? ""].push(r);
        if (r.note) sem.notes.push(r.note);
      }
    }
  });

  const groupedRows = Array.from(groupMap.values());
  const sortedScoreTypes = [...scoreTypes].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));

  if (authLoading)
    return <p style={{ textAlign: "center", color: "#555" }}>🔄 Đang xác thực người dùng...</p>;

  return (
    <motion.div style={styles.container} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={styles.heading}>
        <BookOpen style={{ fontSize: 32, color: "#4338ca" }} /> Hồ Sơ Học Tập
      </h2>

      {/* Score Legend Section */}
      <div style={styles.scoreLegend}>
        <div style={styles.legendItem}>
          <div
            style={{
              ...styles.legendBox,
              backgroundColor: '#f8d7da', // Weak
            }}
          ></div>
          <span>0 - 5: Yếu</span>
        </div>
        <div style={styles.legendItem}>
          <div
            style={{
              ...styles.legendBox,
              backgroundColor: '#fef2c0', // Average
            }}
          ></div>
          <span>5.1 - 7: Trung bình</span>
        </div>
        <div style={styles.legendItem}>
          <div
            style={{
              ...styles.legendBox,
              backgroundColor: '#cce4f7', // Good
            }}
          ></div>
          <span>7.1 - 8.9: Tốt</span>
        </div>
        <div style={styles.legendItem}>
          <div
            style={{
              ...styles.legendBox,
              backgroundColor: '#c9f7d5', // High
            }}
          ></div>
          <span>9 - 10: Cao</span>
        </div>
      </div>

      <div style={styles.searchWrapper}>
        <input
          type="text"
          placeholder="🔍 Tìm môn học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#555" }}>Đang tải dữ liệu...</p>
      ) : groupedRows.length === 0 ? (
        <p style={{ textAlign: "center", color: "#555" }}>Không tìm thấy kết quả phù hợp.</p>
      ) : (
        groupedRows.map((row) => {
          const subjectName = getSubjectName(row.subjectId);
          const subjectIcon = getSubjectIcon(subjectName);
          const isEditing = editingSubjectId === row.subjectId;
          const semestersSorted = [...row.semesters].sort((a, b) => a.semester - b.semester);

            function normalizeScoreType(typeId: string): string {
            return typeId.toLowerCase();
            }

          return (
            <section key={`${row.subjectId}-${row.classLevel}`} style={styles.section}>
              <header style={styles.headerFlex}>
                <div style={styles.headerLeft}>
                  {subjectIcon}
                  <h3 style={styles.subjectName}>{subjectName}</h3>
                </div>
                <button onClick={() => toggleEditSubject(row.subjectId)} style={styles.editButton}>
                  <Edit size={20} />
                  <span>{isEditing ? "Hủy" : "Sửa điểm"}</span>
                </button>
              </header>

              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead style={styles.thead}>
                    <tr>
                      <th style={styles.th}>Lớp</th>
                      <th style={styles.th}>Học kỳ</th>
                      <th style={styles.th}>Ngày học</th>
                      <th style={styles.th}>Ghi chú</th>
                      {sortedScoreTypes.map((type) => (
                        <th key={type.id} style={styles.th}>
                          {scoreTypeIcons[type.id?.toLowerCase() ?? ""] ?? "📊"} {type.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {semestersSorted.map((sem) => (
                      <tr key={`${row.subjectId}-${sem.semester}`} style={styles.tbodyRow}>
                        <td style={styles.td}>{row.classLevel}</td>
                        <td style={styles.td}>{sem.semester}</td>
                        <td style={styles.td}>
                          {sem.scoresByType && Object.values(sem.scoresByType).flat()[0]?.date
                            ? new Date(Object.values(sem.scoresByType).flat()[0].date).toLocaleDateString("vi-VN")
                            : "—"}
                        </td>
                        <td style={styles.td}>{sem.notes.join("; ") || "—"}</td>
                        {sortedScoreTypes.map((type) => {
                             const results = sem.scoresByType[type.id ?? ""] || [];
                          return (
                            <td key={type.id} style={styles.td}>
                              {results.length > 0 ? (
                                results.map((res) => {
                                  const score = editedScores[res.id ?? ""] ?? res.score;
                                  const isDeleted = deleteQueue.has(res.id ?? "");
                                  return (
                                    <div key={res.id} style={{ ...styles.scoreBox, backgroundColor: getScoreColor(score), opacity: isDeleted ? 0.5 : 1 }}>
                                      {isEditing ? (
                                        <>
                                          <input
                                            type="number"
                                            min={0}
                                            max={10}
                                            step={0.1}
                                            style={styles.scoreInput}
                                            value={score}
                                            onChange={(e) => onScoreChange(res.id ?? "", e.target.value)}
                                          />
                                          <button
                                            onClick={() => toggleDeleteScore(res.id ?? "")}
                                            style={isDeleted ? styles.scoreUndoBtn : styles.scoreDeleteBtn}
                                          >
                                            {isDeleted ? "↩️" : <Trash2 size={16} />}
                                          </button>
                                        </>
                                      ) : (
                                        <span>{score}</span>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div>—</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isEditing && (
                <div style={styles.actionButtonsWrapper}>
                  <button onClick={handleSaveEditedScores} style={styles.saveBtn}>
                    <Save size={18} /> Lưu thay đổi
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

      <ToastContainer />
    </motion.div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
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
  semester: number;
  semesters: SemesterRow[];
};
 

/* ---------- styles ---------- */
const styles = {
  container: { maxWidth: 1200, margin: "0 auto", padding: "1rem" },

  heading: {
    fontSize: "2.4rem",
    fontWeight: 700,
    fontFamily: "inherit",
    letterSpacing: "-0.02em",
    color: "#1e293b",
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
  th: { padding: "12px 18px", fontWeight: 600, textAlign: "center" as const },
  tbodyRow: { backgroundColor: "#fff", borderRadius: 20 },
  td: { padding: "12px 16px", textAlign: "center" as const },
  scoreBox: {
    borderRadius: 12,
    padding: "4px 8px",
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
    textAlign: "center" as const,
  },
  scoreDeleteBtn: { background: "none", border: "none", color: "#dc2626", cursor: "pointer" },
  scoreUndoBtn: { background: "none", border: "none", color: "#ca8a04", cursor: "pointer" },
  actionButtonsWrapper: {
    marginTop: "1.5rem",
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
  },
  saveBtn: {
    backgroundColor: "#16a34a",
    color: "#fff",
    fontWeight: 700,
    padding: "0.5rem 1.25rem",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
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

/* ---------- helper ---------- */
const getSubjectIcon = (subjectName: string) => {
  const name = (subjectName ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (name.includes("toan") || name.includes("math"))
    return <BookOpen style={{ color: "#4338ca", fontSize: 36 }} />;
  if (name.includes("anh")) return <Languages style={{ color: "#2563eb", fontSize: 36 }} />;
  if (name.includes("ly")) return <Lightbulb style={{ color: "#eab308", fontSize: 36 }} />;
  if (name.includes("sinh")) return <TestTube2 style={{ color: "#15803d", fontSize: 36 }} />;
  if (name.includes("tin")) return <Computer style={{ color: "#0ea5e9", fontSize: 36 }} />;
  return <BookOpen style={{ color: "#6b7280", fontSize: 36 }} />;
};

const getScoreColor = (score: number) => {
  if (score < 5) return "#f8d7da"; // Weak
  if (score < 7) return "#fef2c0"; // Average
  if (score < 9) return "#cce4f7"; // Good
  return "#c9f7d5"; // High
};

/* ---------- main component ---------- */
export default function HoSoHocTapPage() {
  const [learningResults, setLearningResults] = useState<LearningResult[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ edit theo key (subjectId + classLevel)
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // editedScores: map resultId -> score
  const [editedScores, setEditedScores] = useState<Record<string, number>>({});

  // ✅ NEW: giữ điểm gốc để chỉ update cái nào thay đổi thật
  const [originalScores, setOriginalScores] = useState<Record<string, number>>({});

  // deleteQueue
  const [deleteQueue, setDeleteQueue] = useState<Record<string, true>>({});

  const { userId, loading: authLoading } = useFirebaseUser();

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      console.warn("❌ Không có user đăng nhập, bỏ qua tải dữ liệu.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const [results, subs, types] = await Promise.all([
          getAllLearningResults(userId),
          getAllSubjects(),
          getAllScoreTypes(),
        ]);
        setLearningResults(results || []);
        setSubjects(subs || []);
        setScoreTypes(types || []);
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
    if (!resultId) return;

    // cho phép xóa trống input
    if (value === "") {
      setEditedScores((prev) => {
        const clone = { ...prev };
        delete clone[resultId];
        return clone;
      });
      return;
    }

    const num = parseFloat(value);
    if (Number.isNaN(num)) return;

    // ✅ chặn ngoài range
    if (num < 0 || num > 10) return;

    setEditedScores((prev) => ({ ...prev, [resultId]: num }));
  };

  const toggleDeleteScore = (resultId: string) => {
    if (!resultId) return;
    setDeleteQueue((prev) => {
      const next = { ...prev };
      if (next[resultId]) delete next[resultId];
      else next[resultId] = true;
      return next;
    });
  };

  const toggleEditRow = (
  rowKey: string,
  subjectId: string,
  classLevel: number,
  semester: number
) => {

    if (editingKey === rowKey) {
      setEditingKey(null);
      setEditedScores({});
      setOriginalScores({});
      setDeleteQueue({});
      return;
    }

    const rowResults = learningResults.filter(
  (r) =>
    r.subjectId === subjectId &&
    r.classLevel === classLevel &&
    r.semester === semester
);



    const scoresMap: Record<string, number> = {};
    rowResults.forEach((r) => {
      if (r.id) scoresMap[r.id] = r.score;
    });

    setEditingKey(rowKey);
    setEditedScores(scoresMap);
    setOriginalScores(scoresMap); // ✅ NEW: lưu điểm gốc
    setDeleteQueue({});
  };

const handleSave = async () => {
  if (!userId || !editingKey) return;

  try {
    // ✅ FIX: tách key AN TOÀN
    const [subjectId, classLevelStr, semesterStr] = editingKey.split("-");
const classLevel = Number(classLevelStr);
const semester = Number(semesterStr);


    const rowsToSave = learningResults.filter(
  (r) =>
    r.subjectId === subjectId &&
    r.classLevel === classLevel &&
    r.semester === semester &&
    r.id
);


    if (rowsToSave.length === 0) {
      toast.error("Không có dữ liệu hợp lệ để lưu.");
      return;
    }

    for (const r of rowsToSave) {
      const resultId = r.id!;
      if (deleteQueue[resultId]) {
        await deleteLearningResult(resultId);
      } else {
        const newScore =
          editedScores[resultId] !== undefined
            ? editedScores[resultId]
            : r.score;

        const original = originalScores[resultId];

if (newScore !== original) {
  await updateLearningResult(resultId, { score: newScore });
}

      }
    }

    const updated = await getAllLearningResults(userId);
    setLearningResults(updated || []);

    setEditingKey(null);
    setEditedScores({});
    setDeleteQueue({});

    toast.success(`Đã lưu kết quả lớp ${classLevel}`);
  } catch (e) {
    console.error(e);
    toast.error("Lỗi khi lưu kết quả.");
  }
};



  const filteredResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return learningResults;

    return learningResults.filter((r) => {
      const subjectName = getSubjectName(r.subjectId ?? "");
      return subjectName.toLowerCase().includes(q);
    });
  }, [learningResults, search, subjects]);

  const groupedRows = useMemo(() => {
    const groupMap = new Map<string, GroupedRow>();

    filteredResults.forEach((r) => {
      const subjectId = r.subjectId ?? "";
      const classLevel = r.classLevel ?? 0;
      const key = `${subjectId}-${classLevel}-${r.semester}`;


      const existing = groupMap.get(key);

      if (!existing) {
        const semRow: SemesterRow = {
          semester: r.semester,
          notes: r.note ? [r.note] : [],
          scoresByType: { [r.scoreTypeId ?? ""]: [r] },
        };
        groupMap.set(key, { subjectId, classLevel, semester: r.semester, semesters: [semRow] });
        return;
      }

      let sem = existing.semesters.find((s) => s.semester === r.semester);
      if (!sem) {
        sem = {
          semester: r.semester,
          notes: r.note ? [r.note] : [],
          scoresByType: { [r.scoreTypeId ?? ""]: [r] },
        };
        existing.semesters.push(sem);
      } else {
        const typeKey = r.scoreTypeId ?? "";
        if (!sem.scoresByType[typeKey]) sem.scoresByType[typeKey] = [];
        sem.scoresByType[typeKey].push(r);
        if (r.note) sem.notes.push(r.note);
      }
    });

    return Array.from(groupMap.values());
  }, [filteredResults]);

  const sortedScoreTypes = useMemo(
    () => [...scoreTypes].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0)),
    [scoreTypes]
  );

  if (authLoading)
    return <p style={{ textAlign: "center", color: "#555" }}>🔄 Đang xác thực người dùng...</p>;

  return (
    <motion.div style={styles.container} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={styles.heading}>
        <BookOpen style={{ fontSize: 32, color: "#4338ca" }} /> Hồ Sơ Học Tập
      </h2>

      {/* Score Legend */}
      <div style={styles.scoreLegend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, backgroundColor: "#f8d7da" }} />
          <span>0 - 5: Yếu</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, backgroundColor: "#fef2c0" }} />
          <span>5.1 - 7: Trung bình</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, backgroundColor: "#cce4f7" }} />
          <span>7.1 - 8.9: Tốt</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, backgroundColor: "#c9f7d5" }} />
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

          const rowKey = `${row.subjectId}-${row.classLevel}-${row.semester}`;


          const isEditing = editingKey === rowKey;

          const semestersSorted = [...row.semesters].sort((a, b) => a.semester - b.semester);

          function handleSaveEditedScores(): void {
            handleSave();
          }

          return (
            <section key={rowKey} style={styles.section}>
              <header style={styles.headerFlex}>
                <div style={styles.headerLeft}>
                  {subjectIcon}
                  <h3 style={styles.subjectName}>
                    {subjectName} <span style={{ color: "#64748b", fontWeight: 600 }}>• Lớp {row.classLevel}</span>
                  </h3>
                </div>

                <button onClick={() => toggleEditRow(rowKey, row.subjectId, row.classLevel, row.semester)} style={styles.editButton}>
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
                    {semestersSorted.map((sem) => {
                      const firstDate = sem.scoresByType ? Object.values(sem.scoresByType).flat()[0]?.date : undefined;

                      return (
                        <tr key={`${rowKey}-${sem.semester}`} style={styles.tbodyRow}>
                          <td style={styles.td}>{row.classLevel}</td>
                          <td style={styles.td}>{sem.semester}</td>
                          <td style={styles.td}>
                            {firstDate ? new Date(firstDate).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td style={styles.td}>{sem.notes.join("; ") || "—"}</td>

                          {sortedScoreTypes.map((type) => {
                            const typeKey = type.id ?? "";
                            const results = sem.scoresByType?.[typeKey] || [];

                            return (
                              <td key={`${rowKey}-${sem.semester}-${typeKey}`} style={styles.td}>
                                {results.length > 0 ? (
                                  results.map((res, idx) => {
                                    const resId = res.id ?? "";
                                    const score =
                                      resId && editedScores[resId] !== undefined ? editedScores[resId] : res.score;
                                    const isDeleted = !!(resId && deleteQueue[resId]);

                                  const boxKey = resId
  ? `${resId}-${typeKey}-${row.classLevel}-${sem.semester}-${idx}`
  : `${typeKey}-${row.classLevel}-${sem.semester}-${res.score}-${res.date ?? ""}-${idx}`;

                                    return (
                                      <div
                                        key={boxKey}
                                        style={{
                                          ...styles.scoreBox,
                                          backgroundColor: getScoreColor(score),
                                          opacity: isDeleted ? 0.5 : 1,
                                        }}
                                      >
                                        {isEditing ? (
                                          <>
                                            <input
                                              type="number"
                                              min={0}
                                              max={10}
                                              step={0.1}
                                              style={styles.scoreInput}
                                              value={
                                                resId && editedScores[resId] !== undefined ? editedScores[resId] : score
                                              }
                                              onChange={(e) => onScoreChange(resId, e.target.value)}
                                              disabled={!resId}
                                              title={!resId ? "Thiếu id nên không sửa/xóa được mục này" : undefined}
                                            />
                                            <button
                                              onClick={() =>
                                                toggleEditRow(rowKey, row.subjectId, row.classLevel, row.semester)
                                              }

                                              style={isDeleted ? styles.scoreUndoBtn : styles.scoreDeleteBtn}
                                              disabled={!resId}
                                              title={!resId ? "Thiếu id nên không sửa/xóa được mục này" : undefined}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {isEditing && (
                <div style={styles.actionButtonsWrapper}>
                  <button onClick={handleSaveEditedScores} style={styles.saveBtn}>
                    <Save size={18} /> Lưu thay đổi
                  </button>
                  <button onClick={() => toggleEditRow(rowKey, row.subjectId, row.classLevel, row.semester)} style={styles.cancelBtn}>
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

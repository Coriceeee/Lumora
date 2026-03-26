import React, { useEffect, useMemo, useState } from "react";
import { motion } from "../../../utils/fakeMotion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getAllLearningResults,
  updateLearningResult,
  deleteLearningResult,
} from "../../../services/learningResultService";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";
import { LearningResult } from "../../../types/LearningResult";
import { Subject } from "../../../types/Subject";
import { ScoreType } from "../../../types/ScoreType";
import { useFirebaseUser } from "../../hooks/useFirebaseUser";

import {
  BookOpen,
  Computer,
  Edit,
  Trash2,
  Save,
  Search,
  Award,
  RotateCcw,
} from "lucide-react";

/* ================= TYPES ================= */
type SemesterData = {
  semester: number;
  scoresByType: Record<string, LearningResult[]>;
};

type ClassGroup = {
  subjectId: string;
  classLevel: number;
  semesters: Record<number, SemesterData>;
};

type EditMap = Record<string, string>;
type OriginalMap = Record<string, number>;
type DeletedMap = Record<string, true>;

/* ================= UTILS ================= */
const scoreBg = (v: number) => {
  if (v < 5) return "#fee2e2";
  if (v < 7) return "#fef3c7";
  if (v < 9) return "#e0f2fe";
  return "#dcfce7";
};

const avg = (arr: number[]) =>
  arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : null;

const normalizeScoreInput = (value: string) => {
  let v = value.replace(",", ".").replace(/[^\d.]/g, "");

  const parts = v.split(".");
  if (parts.length > 2) {
    v = `${parts[0]}.${parts.slice(1).join("")}`;
  }

  return v;
};

const isValidScoreNumber = (n: number) =>
  !Number.isNaN(n) && Number.isFinite(n) && n >= 0 && n <= 10;

const parseScore = (value: string) => {
  if (value.trim() === "") return null;
  const n = Number(value);
  return isValidScoreNumber(n) ? n : null;
};

/* ================= SCORE SCALE ================= */
const ScoreScale = () => (
  <div
    style={{
      background: "linear-gradient(180deg,#ffffff,#f8fafc)",
      borderRadius: 28,
      padding: "2rem",
      marginBottom: "2.5rem",
      boxShadow:
        "0 25px 60px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,.6)",
      border: "1px solid rgba(15,23,42,0.06)",
    }}
  >
    <h3 style={{ fontSize: "1.45rem", fontWeight: 900, marginBottom: 18 }}>
      🎯 Thang đánh giá kết quả học tập
    </h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 18,
      }}
    >
      {[
        { label: "Yếu", range: "< 5.0", color: "#fee2e2" },
        { label: "Trung bình", range: "5.0 – 6.9", color: "#fef3c7" },
        { label: "Khá", range: "7.0 – 8.9", color: "#e0f2fe" },
        { label: "Giỏi", range: "9.0 – 10", color: "#dcfce7" },
      ].map((s) => (
        <div
          key={s.label}
          style={{
            borderRadius: 22,
            padding: "1.4rem",
            background: s.color,
            boxShadow: "0 12px 28px rgba(0,0,0,.08)",
            fontWeight: 900,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.2rem" }}>{s.label}</div>
          <div style={{ opacity: 0.7 }}>{s.range}</div>
        </div>
      ))}
    </div>
  </div>
);

/* ================= MAIN ================= */
export default function HoSoHocTapPage() {
  const { userId } = useFirebaseUser();

  const [results, setResults] = useState<LearningResult[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [search, setSearch] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [edited, setEdited] = useState<EditMap>({});
  const [original, setOriginal] = useState<OriginalMap>({});
  const [deleted, setDeleted] = useState<DeletedMap>({});

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!userId) {
      setResults([]);
      setPageLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        setPageLoading(true);

        const [r, s, t] = await Promise.all([
          getAllLearningResults(userId),
          getAllSubjects(),
          getAllScoreTypes(),
        ]);

        if (!isMounted) return;

        setResults(Array.isArray(r) ? r : []);
        setSubjects(Array.isArray(s) ? s : []);
        setScoreTypes(Array.isArray(t) ? t : []);
      } catch (error) {
        console.error("Lỗi tải hồ sơ học tập:", error);
        if (isMounted) {
          toast.error("Không thể tải dữ liệu hồ sơ học tập.");
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  /* ================= GROUP ================= */
  const grouped = useMemo(() => {
    const map = new Map<string, ClassGroup>();

    results.forEach((r) => {
      if (
        !r?.id ||
        !r?.subjectId ||
        r?.classLevel == null ||
        r?.semester == null ||
        !r?.scoreTypeId ||
        typeof r?.score !== "number"
      ) {
        return;
      }

      const key = `${r.subjectId}-${r.classLevel}`;

      if (!map.has(key)) {
        map.set(key, {
          subjectId: r.subjectId,
          classLevel: r.classLevel,
          semesters: {},
        });
      }

      const group = map.get(key);
      if (!group) return;

      if (!group.semesters[r.semester]) {
        group.semesters[r.semester] = {
          semester: r.semester,
          scoresByType: {},
        };
      }

      const semester = group.semesters[r.semester];

      if (!semester.scoresByType[r.scoreTypeId]) {
        semester.scoresByType[r.scoreTypeId] = [];
      }

      semester.scoresByType[r.scoreTypeId].push(r);
    });

    const keyword = search.trim().toLowerCase();

    return [...map.values()].filter((g) => {
      const subjectName =
        subjects.find((s) => s.id === g.subjectId)?.name?.toLowerCase() ?? "";

      if (!keyword) return true;
      return subjectName.includes(keyword);
    });
  }, [results, subjects, search]);

  /* ================= EDIT HELPERS ================= */
  const resetEditState = () => {
    setEditingKey(null);
    setEdited({});
    setOriginal({});
    setDeleted({});
  };

  const beginEdit = (group: ClassGroup, key: string) => {
    const nextOriginal: OriginalMap = {};
    const nextEdited: EditMap = {};

    Object.values(group.semesters).forEach((sem) => {
      Object.values(sem.scoresByType).forEach((list) => {
        list.forEach((r) => {
          if (!r.id || typeof r.score !== "number") return;
          nextOriginal[r.id] = r.score;
          nextEdited[r.id] = String(r.score);
        });
      });
    });

    setEditingKey(key);
    setOriginal(nextOriginal);
    setEdited(nextEdited);
    setDeleted({});
  };

  const handleToggleEdit = (group: ClassGroup, key: string) => {
    if (saving) return;

    if (editingKey === key) {
      resetEditState();
      return;
    }

    beginEdit(group, key);
  };

  const handleChangeScore = (id: string, rawValue: string) => {
    const normalized = normalizeScoreInput(rawValue);

    setEdited((prev) => ({
      ...prev,
      [id]: normalized,
    }));

    if (deleted[id]) {
      setDeleted((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleToggleDelete = (id: string) => {
    setDeleted((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  };

  const handleCancelEdit = () => {
    if (saving) return;
    resetEditState();
  };

  /* ================= CALC ================= */
  const calcTBHK = (sem?: SemesterData) => {
    if (!sem) return null;

    let total = 0;
    let weight = 0;

    scoreTypes.forEach((t) => {
      if (!t?.id) return;

      const list = sem.scoresByType[t.id] || [];

      const activeScores = list
        .filter((r) => r.id && !deleted[r.id])
        .map((r) => {
          if (!r.id) return null;

          if (editingKey) {
            const editedValue = edited[r.id];
            const parsed =
              editedValue !== undefined ? parseScore(editedValue) : r.score;
            return parsed;
          }

          return typeof r.score === "number" ? r.score : null;
        })
        .filter((v): v is number => v !== null);

      const tb = avg(activeScores);

      if (tb !== null) {
        total += tb * (t.weight ?? 1);
        weight += t.weight ?? 1;
      }
    });

    return weight ? +(total / weight).toFixed(2) : null;
  };

  const calcTBCN = (hk1?: number | null, hk2?: number | null) => {
    if (hk1 == null && hk2 == null) return null;
    if (hk1 != null && hk2 == null) return hk1;
    if (hk1 == null && hk2 != null) return hk2;
    return +((hk1! + hk2! * 2) / 3).toFixed(2);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!editingKey) return;

    const idsToDelete = Object.keys(deleted);
    const idsInCurrentEdit = Object.keys(original);

    const invalidIds: string[] = [];

    for (const id of idsInCurrentEdit) {
      if (deleted[id]) continue;

      const raw = edited[id];
      const parsed = parseScore(raw ?? "");

      if (parsed === null) {
        invalidIds.push(id);
      }
    }

    if (invalidIds.length > 0) {
      toast.error("Có điểm không hợp lệ. Vui lòng nhập từ 0 đến 10.");
      return;
    }

    const updates: Array<{ id: string; score: number }> = [];

    idsInCurrentEdit.forEach((id) => {
      if (deleted[id]) return;

      const raw = edited[id];
      const parsed = parseScore(raw ?? "");
      if (parsed === null) return;

      if (parsed !== original[id]) {
        updates.push({ id, score: parsed });
      }
    });

    try {
      setSaving(true);

      if (idsToDelete.length > 0) {
        await Promise.all(idsToDelete.map((id) => deleteLearningResult(id)));
      }

      if (updates.length > 0) {
        await Promise.all(
          updates.map((item) =>
            updateLearningResult(item.id, { score: item.score })
          )
        );
      }

      setResults((prev) =>
        prev
          .filter((item) => !item.id || !deleted[item.id])
          .map((item) => {
            if (!item.id) return item;

            const updated = updates.find((u) => u.id === item.id);
            if (!updated) return item;

            return {
              ...item,
              score: updated.score,
            };
          })
      );

      toast.success("Đã lưu thay đổi");
      resetEditState();
    } catch (error) {
      console.error("Lỗi lưu chỉnh sửa hồ sơ học tập:", error);
      toast.error("Lưu thay đổi thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        maxWidth: 1300,
        margin: "0 auto",
        padding: "2.2rem",
        background: "#f1f5f9",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2.6rem",
          fontWeight: 900,
          textAlign: "center",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <BookOpen /> Hồ sơ học tập
      </h1>

      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0.7rem 1.2rem",
            borderRadius: 999,
            background: "#fff",
            boxShadow:
              "0 14px 35px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,.6)",
            border: "1px solid rgba(15,23,42,.06)",
            width: 380,
            maxWidth: "100%",
          }}
        >
          <Search size={18} />
          <input
            placeholder="Tìm môn học…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "1rem",
              fontWeight: 600,
              background: "transparent",
            }}
          />
        </div>
      </div>

      <ScoreScale />

      {pageLoading ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 28,
            padding: "2rem",
            textAlign: "center",
            fontWeight: 800,
            color: "#475569",
            boxShadow: "0 20px 45px rgba(15,23,42,0.10)",
          }}
        >
          Đang tải hồ sơ học tập...
        </div>
      ) : grouped.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 28,
            padding: "2rem",
            textAlign: "center",
            fontWeight: 800,
            color: "#64748b",
            boxShadow: "0 20px 45px rgba(15,23,42,0.10)",
          }}
        >
          Không có dữ liệu học tập phù hợp.
        </div>
      ) : (
        grouped.map((g) => {
          const subject = subjects.find((s) => s.id === g.subjectId);
          const key = `${g.subjectId}-${g.classLevel}`;
          const editing = editingKey === key;

          const hk1 = calcTBHK(g.semesters[1]);
          const hk2 = calcTBHK(g.semesters[2]);
          const tbc = calcTBCN(hk1, hk2);

          return (
            <div
              key={key}
              style={{
                background: "linear-gradient(180deg,#ffffff,#f8fafc)",
                borderRadius: 34,
                padding: "2.4rem",
                marginBottom: "3.5rem",
                boxShadow:
                  "0 35px 80px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,.7)",
                border: "1px solid rgba(15,23,42,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.8rem",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    fontSize: "1.8rem",
                    fontWeight: 900,
                  }}
                >
                  <Computer />
                  {subject?.name ?? "Môn không xác định"} • Lớp {g.classLevel}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleToggleEdit(g, key)}
                    disabled={saving}
                    style={{
                      background: "none",
                      border: "none",
                      fontWeight: 800,
                      color: "#4f46e5",
                      cursor: saving ? "not-allowed" : "pointer",
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    <Edit size={18} />
                    {editing ? "Đang chỉnh sửa" : "Sửa điểm"}
                  </button>

                  {editing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      style={{
                        background: "#fff",
                        color: "#334155",
                        border: "1px solid rgba(15,23,42,.12)",
                        padding: "0.65rem 1rem",
                        borderRadius: 14,
                        fontWeight: 800,
                        cursor: saving ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      <RotateCcw size={16} /> Hủy
                    </button>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                {[1, 2].map((sem) => {
                  const semData = g.semesters[sem];
                  const tb = calcTBHK(semData);

                  return (
                    <div
                      key={sem}
                      style={{
                        background: "#ffffff",
                        borderRadius: 26,
                        padding: "1.8rem",
                        boxShadow: "0 20px 45px rgba(15,23,42,0.12)",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: 900,
                          marginBottom: 16,
                        }}
                      >
                        📘 Học kỳ {sem}
                      </h3>

                      {!semData ? (
                        <div
                          style={{
                            color: "#64748b",
                            fontWeight: 700,
                            padding: "0.8rem 0",
                          }}
                        >
                          Chưa có dữ liệu.
                        </div>
                      ) : (
                        scoreTypes.map((t) => {
                          if (!t?.id) return null;

                          const list = semData.scoresByType[t.id] || [];

                          if (list.length === 0) return null;

                          return (
                            <div key={t.id} style={{ marginBottom: 12 }}>
                              <div
                                style={{
                                  fontWeight: 800,
                                  marginBottom: 6,
                                }}
                              >
                                {t.name}
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                }}
                              >
                                {list.map((r) => {
                                  if (!r.id) return null;

                                  const isDeleted = !!deleted[r.id];
                                  const rawScore =
                                    editing && edited[r.id] !== undefined
                                      ? edited[r.id]
                                      : String(r.score);

                                  const parsedScore = parseScore(rawScore);
                                  const displayScore = rawScore === "" ? "" : rawScore;
                                  const bgScore =
                                    parsedScore ?? (typeof r.score === "number" ? r.score : 0);

                                  return (
                                    <div
                                      key={r.id}
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        minHeight: 44,
                                        padding: "6px 12px 6px 16px",
                                        borderRadius: 999,
                                        background: isDeleted
                                          ? "#e2e8f0"
                                          : scoreBg(bgScore),
                                        boxShadow:
                                          "0 8px 18px rgba(15,23,42,0.12)",
                                        fontWeight: 900,
                                        opacity: isDeleted ? 0.45 : 1,
                                        gap: 10,
                                      }}
                                    >
                                      {editing ? (
                                        <>
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 10,
                                              flex: 1,
                                            }}
                                          >
                                            <input
                                              type="text"
                                              inputMode="decimal"
                                              value={displayScore}
                                              onChange={(e) =>
                                                handleChangeScore(
                                                  r.id!,
                                                  e.target.value
                                                )
                                              }
                                              disabled={isDeleted || saving}
                                              style={{
                                                width: 72,
                                                height: 32,
                                                borderRadius: 10,
                                                border: "1px solid #c7d2fe",
                                                textAlign: "center",
                                                fontWeight: 800,
                                                opacity: isDeleted ? 0.7 : 1,
                                              }}
                                            />

                                            {displayScore !== "" &&
                                              parsedScore === null &&
                                              !isDeleted && (
                                                <span
                                                  style={{
                                                    color: "#b91c1c",
                                                    fontSize: 12,
                                                    fontWeight: 800,
                                                  }}
                                                >
                                                  0–10
                                                </span>
                                              )}
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => handleToggleDelete(r.id!)}
                                            disabled={saving}
                                            title={
                                              isDeleted
                                                ? "Hoàn tác xóa"
                                                : "Đánh dấu xóa"
                                            }
                                            style={{
                                              background: "rgba(15,23,42,0.08)",
                                              border: "none",
                                              borderRadius: 10,
                                              padding: 6,
                                              cursor: saving
                                                ? "not-allowed"
                                                : "pointer",
                                              display: "inline-flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              opacity: saving ? 0.6 : 1,
                                            }}
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </>
                                      ) : (
                                        <span>{r.score}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}

                      <div
                        style={{
                          marginTop: 16,
                          fontWeight: 900,
                          fontSize: "1.05rem",
                          textAlign: "right",
                        }}
                      >
                        TB học kỳ:{" "}
                        <span style={{ color: "#2563eb" }}>{tb ?? "—"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 28,
                  padding: "1.4rem 1.8rem",
                  borderRadius: 24,
                  background: "linear-gradient(90deg,#4f46e5,#22c55e)",
                  color: "#fff",
                  fontSize: "1.35rem",
                  fontWeight: 900,
                  textAlign: "right",
                  boxShadow: "0 22px 50px rgba(34,197,94,.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <Award size={22} />
                Trung bình cả năm: {tbc ?? "—"}
              </div>

              {editing && (
                <div style={{ marginTop: 22, textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      padding: "0.7rem 1.6rem",
                      borderRadius: 16,
                      fontWeight: 900,
                      cursor: saving ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    <Save size={18} />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
}
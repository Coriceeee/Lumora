import React, { useCallback, useEffect, useMemo, useState } from "react";
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
<<<<<<< Updated upstream
=======
  Loader2,
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
type EditMap = Record<string, string>;
type OriginalMap = Record<string, number>;
=======
type EditValueMap = Record<string, string>;
type NumberMap = Record<string, number>;
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
const normalizeSearch = (value: string) => value.trim().toLowerCase();

const normalizeScoreInput = (value: string) => value.replace(",", ".").trim();

const parseValidScore = (value: string): number | null => {
  const normalized = normalizeScoreInput(value);
  if (!normalized) return null;
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const n = Number(normalized);
  if (Number.isNaN(n)) return null;
  if (n < 0 || n > 10) return null;

  return +n.toFixed(2);
};

const formatScore = (value: number) => {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
};

const sortResultsStable = (items: LearningResult[], scoreTypes: ScoreType[]) => {
  const scoreTypeWeightMap = new Map(
    scoreTypes.map((t, index) => [t.id ?? `__${index}`, t.weight ?? 1])
  );

  return [...items].sort((a, b) => {
    const classDiff = (a.classLevel ?? 0) - (b.classLevel ?? 0);
    if (classDiff !== 0) return classDiff;

    const semesterDiff = (a.semester ?? 0) - (b.semester ?? 0);
    if (semesterDiff !== 0) return semesterDiff;

    const wa = scoreTypeWeightMap.get(a.scoreTypeId ?? "") ?? 1;
    const wb = scoreTypeWeightMap.get(b.scoreTypeId ?? "") ?? 1;
    const weightDiff = wa - wb;
    if (weightDiff !== 0) return weightDiff;

    const dateA = a.date ?? "";
    const dateB = b.date ?? "";
    const dateDiff = dateA.localeCompare(dateB);
    if (dateDiff !== 0) return dateDiff;

    return (a.id ?? "").localeCompare(b.id ?? "");
  });
>>>>>>> Stashed changes
};

/* ================= SCORE SCALE ================= */
const ScoreScale = () => (
  <div className="score-scale-card">
    <h3 className="score-scale-title">🎯 Thang đánh giá kết quả học tập</h3>

    <div className="score-scale-grid">
      {[
        { label: "Yếu", range: "< 5.0", color: "#fee2e2" },
        { label: "Trung bình", range: "5.0 – 6.9", color: "#fef3c7" },
        { label: "Khá", range: "7.0 – 8.9", color: "#e0f2fe" },
        { label: "Giỏi", range: "9.0 – 10", color: "#dcfce7" },
      ].map((s) => (
        <div
          key={s.label}
          className="score-scale-item"
          style={{ background: s.color }}
        >
          <div className="score-scale-item-label">{s.label}</div>
          <div className="score-scale-item-range">{s.range}</div>
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
<<<<<<< Updated upstream
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
=======
  const [edited, setEdited] = useState<EditValueMap>({});
  const [original, setOriginal] = useState<NumberMap>({});
  const [deleted, setDeleted] = useState<DeletedMap>({});

  /* ================= LOAD ================= */
  const loadAll = useCallback(async () => {
    if (!userId) return;

    try {
      setPageLoading(true);

      const [r, s, t] = await Promise.all([
        getAllLearningResults(userId),
        getAllSubjects(),
        getAllScoreTypes(),
      ]);

      const safeSubjects = Array.isArray(s) ? s : [];
      const safeScoreTypes = Array.isArray(t) ? t : [];
      const safeResults = Array.isArray(r) ? r : [];

      setSubjects(safeSubjects);
      setScoreTypes(safeScoreTypes);
      setResults(sortResultsStable(safeResults, safeScoreTypes));
    } catch (error) {
      console.error("Load learning profile failed:", error);
      toast.error("Không thể tải hồ sơ học tập.");
    } finally {
      setPageLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!userId) {
        setPageLoading(false);
        return;
      }

>>>>>>> Stashed changes
      try {
        setPageLoading(true);

        const [r, s, t] = await Promise.all([
          getAllLearningResults(userId),
          getAllSubjects(),
          getAllScoreTypes(),
        ]);

<<<<<<< Updated upstream
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
=======
        if (!mounted) return;

        const safeSubjects = Array.isArray(s) ? s : [];
        const safeScoreTypes = Array.isArray(t) ? t : [];
        const safeResults = Array.isArray(r) ? r : [];

        setSubjects(safeSubjects);
        setScoreTypes(safeScoreTypes);
        setResults(sortResultsStable(safeResults, safeScoreTypes));
      } catch (error) {
        console.error("Load learning profile failed:", error);
        if (mounted) {
          toast.error("Không thể tải hồ sơ học tập.");
        }
      } finally {
        if (mounted) {
>>>>>>> Stashed changes
          setPageLoading(false);
        }
      }
    };

<<<<<<< Updated upstream
    loadData();

    return () => {
      isMounted = false;
=======
    run();

    return () => {
      mounted = false;
>>>>>>> Stashed changes
    };
  }, [userId]);

  /* ================= GROUP ================= */
  const grouped = useMemo(() => {
    const map = new Map<string, ClassGroup>();
    const normalizedSearch = normalizeSearch(search);

    results.forEach((r) => {
<<<<<<< Updated upstream
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
=======
      if (!r.subjectId || !r.classLevel || !r.semester || !r.scoreTypeId) return;
>>>>>>> Stashed changes

      const key = `${r.subjectId}-${r.classLevel}`;

      if (!map.has(key)) {
        map.set(key, {
          subjectId: r.subjectId,
          classLevel: r.classLevel,
          semesters: {},
        });
      }

<<<<<<< Updated upstream
      const group = map.get(key);
      if (!group) return;
=======
      const group = map.get(key)!;
>>>>>>> Stashed changes

      if (!group.semesters[r.semester]) {
        group.semesters[r.semester] = {
          semester: r.semester,
          scoresByType: {},
        };
      }

<<<<<<< Updated upstream
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
=======
      const sem = group.semesters[r.semester];
      if (!sem.scoresByType[r.scoreTypeId]) {
        sem.scoresByType[r.scoreTypeId] = [];
      }

      sem.scoresByType[r.scoreTypeId].push(r);
    });

    const values = [...map.values()];

    return values.filter((g) => {
      const subjectName =
        subjects.find((s) => s.id === g.subjectId)?.name?.toLowerCase() || "";

      if (!normalizedSearch) return true;
      return subjectName.includes(normalizedSearch);
>>>>>>> Stashed changes
    });
  }, [results, subjects, search]);

  /* ================= EDIT HELPERS ================= */
<<<<<<< Updated upstream
  const resetEditState = () => {
=======
  const resetEditState = useCallback(() => {
>>>>>>> Stashed changes
    setEditingKey(null);
    setEdited({});
    setOriginal({});
    setDeleted({});
<<<<<<< Updated upstream
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
=======
  }, []);

  const buildOriginalMapFromGroup = useCallback((group: ClassGroup) => {
    const nextOriginal: NumberMap = {};

    Object.values(group.semesters).forEach((sem) => {
      Object.values(sem.scoresByType).forEach((list) => {
        list.forEach((r) => {
          if (r.id && typeof r.score === "number") {
            nextOriginal[r.id] = r.score;
          }
        });
      });
>>>>>>> Stashed changes
    });

    return nextOriginal;
  }, []);

  const handleStartOrCancelEdit = useCallback(
    (group: ClassGroup, key: string) => {
      if (saving) return;

      if (editingKey === key) {
        resetEditState();
        return;
      }

      const nextOriginal = buildOriginalMapFromGroup(group);
      const nextEdited: EditValueMap = {};

      Object.entries(nextOriginal).forEach(([id, value]) => {
        nextEdited[id] = String(value);
      });

      setOriginal(nextOriginal);
      setEdited(nextEdited);
      setDeleted({});
      setEditingKey(key);
    },
    [buildOriginalMapFromGroup, editingKey, resetEditState, saving]
  );

  const toggleDelete = useCallback((id: string) => {
    setDeleted((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  }, []);

  const updateEditedScore = useCallback((id: string, rawValue: string) => {
    const sanitized = rawValue.replace(/[^\d.,]/g, "");
    setEdited((prev) => ({
      ...prev,
      [id]: sanitized,
    }));
  }, []);

  const getDisplayScore = useCallback(
    (r: LearningResult) => {
      const id = r.id ?? "";
      const currentEdited = edited[id];
      if (typeof currentEdited === "string") return currentEdited;
      return typeof r.score === "number" ? String(r.score) : "";
    },
    [edited]
  );

  /* ================= CALC ================= */
  const calcTBHK = useCallback(
    (sem?: SemesterData) => {
      if (!sem) return null;

      let total = 0;
      let weight = 0;

      scoreTypes.forEach((t) => {
        const typeId = t.id;
        if (!typeId) return;

        const list = (sem.scoresByType[typeId] || []).filter(
          (r) => r.id && !deleted[r.id]
        );

        const vals = list
          .map((r) => {
            const id = r.id ?? "";
            const parsed = parseValidScore(edited[id] ?? String(r.score ?? ""));
            return parsed;
          })
          .filter((n): n is number => typeof n === "number" && !Number.isNaN(n));

        const tb = avg(vals);
        if (tb !== null) {
          total += tb * (t.weight ?? 1);
          weight += t.weight ?? 1;
        }
      });

      return weight ? +(total / weight).toFixed(2) : null;
    },
    [scoreTypes, deleted, edited]
  );

  const calcTBCN = (hk1?: number | null, hk2?: number | null) => {
    if (hk1 == null && hk2 == null) return null;
    if (hk1 != null && hk2 == null) return hk1;
    if (hk1 == null && hk2 != null) return hk2;
    return +((hk1! + hk2! * 2) / 3).toFixed(2);
  };

  /* ================= SAVE ================= */
<<<<<<< Updated upstream
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
=======
  const handleSave = useCallback(async () => {
    if (saving || !editingKey) return;

    try {
      setSaving(true);

      const idsToDelete = Object.keys(deleted);

      const invalidIds = Object.entries(edited)
        .filter(([id]) => !deleted[id])
        .filter(([id, value]) => {
          if (original[id] === undefined) return false;
          return parseValidScore(value) === null;
        })
        .map(([id]) => id);

      if (invalidIds.length > 0) {
        toast.error("Có điểm không hợp lệ. Vui lòng nhập trong khoảng 0–10.");
        return;
>>>>>>> Stashed changes
      }

<<<<<<< Updated upstream
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
=======
      const updates = Object.entries(edited)
        .filter(([id]) => !deleted[id])
        .map(([id, value]) => {
          const parsed = parseValidScore(value);
          return {
            id,
            value: parsed,
            originalValue: original[id],
          };
        })
        .filter(
          (item): item is { id: string; value: number; originalValue: number } =>
            typeof item.value === "number" &&
            typeof item.originalValue === "number" &&
            item.value !== item.originalValue
        );

      const deleteResults = await Promise.allSettled(
        idsToDelete.map((id) => deleteLearningResult(id))
      );

      const failedDeleteCount = deleteResults.filter(
        (x) => x.status === "rejected"
      ).length;

      const successfulDeleteIds = idsToDelete.filter(
        (_, index) => deleteResults[index].status === "fulfilled"
      );

      const updateResults = await Promise.allSettled(
        updates.map((item) =>
          updateLearningResult(item.id, { score: item.value })
        )
      );

      const failedUpdateCount = updateResults.filter(
        (x) => x.status === "rejected"
      ).length;

      const successfulUpdates = updates.filter(
        (_, index) => updateResults[index].status === "fulfilled"
      );

      setResults((prev) => {
        const deletedSet = new Set(successfulDeleteIds);
        const updatedMap = new Map(successfulUpdates.map((u) => [u.id, u.value]));

        const next = prev
          .filter((item) => !item.id || !deletedSet.has(item.id))
          .map((item) => {
            if (!item.id) return item;
            if (!updatedMap.has(item.id)) return item;
            return {
              ...item,
              score: updatedMap.get(item.id)!,
            };
          });

        return sortResultsStable(next, scoreTypes);
      });

      const successDeleteCount = successfulDeleteIds.length;
      const successUpdateCount = successfulUpdates.length;

      if (failedDeleteCount === 0 && failedUpdateCount === 0) {
        toast.success("Đã lưu thay đổi.");
        resetEditState();
        return;
      }

      if (successDeleteCount > 0 || successUpdateCount > 0) {
        toast.warning(
          `Đã lưu một phần: xóa ${successDeleteCount}, cập nhật ${successUpdateCount}. Có ${failedDeleteCount + failedUpdateCount} thao tác thất bại.`
        );
      } else {
        toast.error("Không thể lưu thay đổi.");
      }

      resetEditState();
    } catch (error) {
      console.error("Save learning profile failed:", error);
      toast.error("Không thể lưu thay đổi.");
    } finally {
      setSaving(false);
    }
  }, [saving, editingKey, deleted, edited, original, scoreTypes, resetEditState]);

  /* ================= RENDER HELPERS ================= */
  const renderSemesterCard = (g: ClassGroup, sem: 1 | 2, editing: boolean) => {
    const semData = g.semesters[sem];
    const tb = calcTBHK(semData);

    return (
      <div key={sem} className="semester-card">
        <h3 className="semester-title">📘 Học kỳ {sem}</h3>

        {scoreTypes.map((t) => {
          const typeId = t.id;
          if (!typeId) return null;

          const list = semData?.scoresByType[typeId] || [];

          return (
            <div key={typeId} className="score-type-block">
              <div className="score-type-title">{t.name}</div>

              <div className="score-list">
                {list.length === 0 ? (
                  <div className="empty-score-row">Chưa có điểm</div>
                ) : (
                  list.map((r) => {
                    const id = r.id ?? "";
                    const faded = !!deleted[id];
                    const displayRaw = getDisplayScore(r);
                    const parsedScore = parseValidScore(displayRaw);
                    const scoreColor = scoreBg(
                      parsedScore ?? (typeof r.score === "number" ? r.score : 0)
                    );
                    const hasInvalidInput = editing && !faded && displayRaw !== "" && parsedScore === null;

                    return (
                      <div
                        key={id}
                        className="score-row"
                        style={{
                          opacity: faded ? 0.45 : 1,
                          background: scoreColor,
                        }}
                      >
                        {editing ? (
                          <>
                            <div className="score-row-left">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={displayRaw}
                                onChange={(e) => updateEditedScore(id, e.target.value)}
                                className={`score-input ${hasInvalidInput ? "score-input-error" : ""}`}
                                placeholder="0 - 10"
                                disabled={saving}
                              />
                              {hasInvalidInput && (
                                <span className="score-inline-error">
                                  Điểm không hợp lệ
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleDelete(id)}
                              className={`delete-btn ${faded ? "undo-mode" : ""}`}
                              disabled={saving}
                              title={faded ? "Hoàn tác xóa" : "Đánh dấu xóa"}
                            >
                              {faded ? <RotateCcw size={14} /> : <Trash2 size={14} />}
                            </button>
                          </>
                        ) : (
                          <span className="score-readonly">
                            {typeof r.score === "number" ? formatScore(r.score) : "—"}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        <div className="semester-avg">
          TB học kỳ: <span>{tb ?? "—"}</span>
        </div>
      </div>
    );
>>>>>>> Stashed changes
  };

  /* ================= UI ================= */
  if (!userId && !pageLoading) {
    return (
      <div className="hoso-page">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="empty-state">Bạn chưa đăng nhập.</div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="hoso-page"
    >
<<<<<<< Updated upstream
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
=======
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="page-title">
        <BookOpen size={30} />
        <span>Hành trình học tập</span>
      </h1>

      <div className="search-wrap">
        <div className="search-box">
>>>>>>> Stashed changes
          <Search size={18} />
          <input
            placeholder="Tìm môn học…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
<<<<<<< Updated upstream
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "1rem",
              fontWeight: 600,
              background: "transparent",
            }}
=======
>>>>>>> Stashed changes
          />
        </div>
      </div>

      <ScoreScale />

      {pageLoading ? (
<<<<<<< Updated upstream
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
=======
        <div className="loading-wrap">
          <div className="skeleton-card large" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="empty-state">
          {search.trim() ? "Không tìm thấy môn học phù hợp." : "Chưa có dữ liệu học tập."}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
            <div key={key} className="group-card">
              <div className="group-header">
                <div className="group-title">
                  <Computer size={24} />
                  <span>
                    {subject?.name || "Không rõ môn"} • Lớp {g.classLevel}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartOrCancelEdit(g, key)}
                  className="edit-toggle-btn"
                  disabled={saving}
                >
                  <Edit size={18} />
                  {editing ? "Hủy" : "Sửa điểm"}
                </button>
              </div>

              <div className="semester-grid">
                {renderSemesterCard(g, 1, editing)}
                {renderSemesterCard(g, 2, editing)}
              </div>

              <div className="year-avg-hero">
                <Award style={{ marginRight: 8 }} />
>>>>>>> Stashed changes
                Trung bình cả năm: {tbc ?? "—"}
              </div>

              {editing && (
<<<<<<< Updated upstream
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
=======
                <div className="actions-row">
                  <button
                    type="button"
                    onClick={resetEditState}
                    className="cancel-btn"
                    disabled={saving}
                  >
                    <RotateCcw size={18} />
                    Hủy chỉnh sửa
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="save-btn"
                    disabled={saving}
                  >
                    {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
>>>>>>> Stashed changes
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

<<<<<<< Updated upstream
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
}
=======
      <style>{styles}</style>
    </motion.div>
  );
}

const styles = `
  .hoso-page{
    max-width: 1300px;
    margin: 0 auto;
    padding: 2rem;
    background:
      radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,.10), transparent 60%),
      radial-gradient(900px 500px at 80% 20%, rgba(34,197,94,.10), transparent 60%),
      #f1f5f9;
    min-height: 100vh;
    font-family: Inter, system-ui, sans-serif;
  }

  .page-title{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:12px;
    font-size:2.5rem;
    font-weight:900;
    text-align:center;
    margin:0 0 2rem;
    color:#0f172a;
    flex-wrap:wrap;
  }

  .search-wrap{
    display:flex;
    justify-content:center;
    margin-bottom:30px;
  }

  .search-box{
    display:flex;
    align-items:center;
    gap:12px;
    padding:0.8rem 1.2rem;
    border-radius:999px;
    background:#fff;
    box-shadow:0 14px 35px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,.6);
    border:1px solid rgba(15,23,42,.06);
    width:min(420px, 100%);
  }

  .search-box input{
    border:none;
    outline:none;
    width:100%;
    font-size:1rem;
    font-weight:600;
    background:transparent;
  }

  .score-scale-card{
    background:linear-gradient(180deg,#ffffff,#f8fafc);
    border-radius:28px;
    padding:2rem;
    margin-bottom:2.5rem;
    box-shadow:0 25px 60px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,.6);
    border:1px solid rgba(15,23,42,0.06);
  }

  .score-scale-title{
    font-size:1.45rem;
    font-weight:900;
    margin-bottom:18px;
    color:#0f172a;
  }

  .score-scale-grid{
    display:grid;
    grid-template-columns:repeat(4, 1fr);
    gap:18px;
  }

  .score-scale-item{
    border-radius:22px;
    padding:1.4rem;
    box-shadow:0 12px 28px rgba(0,0,0,.08);
    font-weight:900;
    text-align:center;
  }

  .score-scale-item-label{
    font-size:1.15rem;
    color:#0f172a;
  }

  .score-scale-item-range{
    opacity:.75;
    margin-top:4px;
    color:#334155;
  }

  .group-card{
    background:linear-gradient(180deg,#ffffff,#f8fafc);
    border-radius:34px;
    padding:2.2rem;
    margin-bottom:3rem;
    box-shadow:0 35px 80px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,.7);
    border:1px solid rgba(15,23,42,0.06);
  }

  .group-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:16px;
    margin-bottom:1.8rem;
    flex-wrap:wrap;
  }

  .group-title{
    display:flex;
    align-items:center;
    gap:12px;
    font-size:1.7rem;
    font-weight:900;
    color:#0f172a;
  }

  .edit-toggle-btn{
    background:none;
    border:none;
    font-weight:800;
    color:#4f46e5;
    cursor:pointer;
    display:flex;
    gap:6px;
    align-items:center;
    font-size:1rem;
  }

  .edit-toggle-btn:disabled{
    opacity:.6;
    cursor:not-allowed;
  }

  .semester-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:24px;
  }

  .semester-card{
    background:#ffffff;
    border-radius:26px;
    padding:1.6rem;
    box-shadow:0 20px 45px rgba(15,23,42,0.12);
    min-width:0;
  }

  .semester-title{
    font-size:1.35rem;
    font-weight:900;
    margin:0 0 16px;
    color:#0f172a;
  }

  .score-type-block{
    margin-bottom:14px;
  }

  .score-type-title{
    font-weight:800;
    margin-bottom:8px;
    color:#1e293b;
  }

  .score-list{
    display:flex;
    flex-direction:column;
    gap:8px;
  }

  .empty-score-row{
    height:40px;
    border-radius:999px;
    background:#f8fafc;
    border:1px dashed #cbd5e1;
    display:flex;
    align-items:center;
    justify-content:center;
    color:#64748b;
    font-weight:700;
    padding:0 12px;
  }

  .score-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    min-height:44px;
    padding:8px 14px;
    border-radius:999px;
    box-shadow:0 8px 18px rgba(15,23,42,0.12);
    gap:10px;
  }

  .score-row-left{
    display:flex;
    align-items:center;
    gap:10px;
    flex-wrap:wrap;
    min-width:0;
  }

  .score-input{
    width:74px;
    height:32px;
    border-radius:10px;
    border:1px solid #c7d2fe;
    text-align:center;
    font-weight:800;
    outline:none;
    background:#fff;
  }

  .score-input:focus{
    border-color:#4f46e5;
    box-shadow:0 0 0 4px rgba(79,70,229,.12);
  }

  .score-input-error{
    border-color:#dc2626;
    box-shadow:0 0 0 4px rgba(220,38,38,.10);
  }

  .score-inline-error{
    font-size:.82rem;
    font-weight:800;
    color:#b91c1c;
  }

  .score-readonly{
    font-weight:900;
    color:#0f172a;
  }

  .delete-btn{
    background:rgba(15,23,42,0.08);
    border:none;
    border-radius:10px;
    padding:6px;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    justify-content:center;
  }

  .delete-btn.undo-mode{
    background:rgba(79,70,229,.14);
    color:#312e81;
  }

  .delete-btn:disabled{
    opacity:.6;
    cursor:not-allowed;
  }

  .semester-avg{
    margin-top:16px;
    font-weight:900;
    font-size:1.05rem;
    text-align:right;
    color:#0f172a;
  }

  .semester-avg span{
    color:#2563eb;
  }

  .year-avg-hero{
    margin-top:28px;
    padding:1.3rem 1.7rem;
    border-radius:24px;
    background:linear-gradient(90deg,#4f46e5,#22c55e);
    color:#fff;
    font-size:1.3rem;
    font-weight:900;
    text-align:right;
    box-shadow:0 22px 50px rgba(34,197,94,.45);
    display:flex;
    align-items:center;
    justify-content:flex-end;
    flex-wrap:wrap;
    gap:6px;
  }

  .actions-row{
    margin-top:22px;
    display:flex;
    justify-content:flex-end;
    gap:12px;
    flex-wrap:wrap;
  }

  .save-btn,
  .cancel-btn{
    border:none;
    padding:0.8rem 1.4rem;
    border-radius:16px;
    font-weight:900;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    gap:8px;
  }

  .save-btn{
    background:#16a34a;
    color:#fff;
  }

  .cancel-btn{
    background:#e2e8f0;
    color:#0f172a;
  }

  .save-btn:disabled,
  .cancel-btn:disabled{
    opacity:.65;
    cursor:not-allowed;
  }

  .loading-wrap{
    display:grid;
    gap:18px;
  }

  .skeleton-card{
    height:180px;
    border-radius:28px;
    background:linear-gradient(90deg, rgba(255,255,255,.7), rgba(255,255,255,.35), rgba(255,255,255,.7));
    border:1px solid rgba(0,0,0,.06);
    box-shadow:0 18px 45px rgba(0,0,0,.10);
    animation:shimmer 1.2s infinite linear;
    background-size:200% 100%;
  }

  .skeleton-card.large{
    height:240px;
  }

  .empty-state{
    margin-top:40px;
    background:#fff;
    border:1px solid rgba(15,23,42,.06);
    border-radius:24px;
    padding:2rem;
    text-align:center;
    font-weight:800;
    color:#475569;
    box-shadow:0 18px 40px rgba(15,23,42,.10);
  }

  .spin{
    animation:spin 1s linear infinite;
  }

  @keyframes shimmer{
    0%{ background-position:200% 0; }
    100%{ background-position:-200% 0; }
  }

  @keyframes spin{
    from{ transform:rotate(0deg); }
    to{ transform:rotate(360deg); }
  }

  @media (max-width: 980px){
    .score-scale-grid,
    .semester-grid{
      grid-template-columns:1fr;
    }
  }

  @media (max-width: 700px){
    .hoso-page{
      padding:1rem;
    }

    .page-title{
      font-size:2rem;
    }

    .group-card{
      padding:1.2rem;
      border-radius:22px;
    }

    .semester-card{
      padding:1rem;
      border-radius:18px;
    }

    .group-title{
      font-size:1.25rem;
    }

    .year-avg-hero{
      font-size:1.05rem;
      text-align:left;
      justify-content:flex-start;
    }

    .search-box{
      width:100%;
    }

    .score-scale-card{
      padding:1.2rem;
      border-radius:20px;
    }
  }
`;
>>>>>>> Stashed changes

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

/* ================= UTILS ================= */
const scoreBg = (v: number) => {
  if (v < 5) return "#fee2e2";
  if (v < 7) return "#fef3c7";
  if (v < 9) return "#e0f2fe";
  return "#dcfce7";
};

const avg = (arr: number[]) =>
  arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : null;

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

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [edited, setEdited] = useState<Record<string, number>>({});
  const [original, setOriginal] = useState<Record<string, number>>({});
  const [deleted, setDeleted] = useState<Record<string, true>>({});

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!userId) return;
    Promise.all([
      getAllLearningResults(userId),
      getAllSubjects(),
      getAllScoreTypes(),
    ]).then(([r, s, t]) => {
      setResults(r || []);
      setSubjects(s || []);
      setScoreTypes(t || []);
    });
  }, [userId]);

  /* ================= GROUP ================= */
  const grouped = useMemo(() => {
    const map = new Map<string, ClassGroup>();

    results.forEach((r) => {
      const key = `${r.subjectId}-${r.classLevel}`;
      if (!map.has(key)) {
        map.set(key, {
          subjectId: r.subjectId!,
          classLevel: r.classLevel!,
          semesters: {},
        });
      }

      const g = map.get(key)!;
      if (!g.semesters[r.semester!]) {
        g.semesters[r.semester!] = {
          semester: r.semester!,
          scoresByType: {},
        };
      }

      const sem = g.semesters[r.semester!];
      if (!sem.scoresByType[r.scoreTypeId!])
        sem.scoresByType[r.scoreTypeId!] = [];
      sem.scoresByType[r.scoreTypeId!].push(r);
    });

    return [...map.values()].filter((g) =>
      subjects
        .find((s) => s.id === g.subjectId)
        ?.name.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [results, subjects, search]);

  /* ================= CALC ================= */
  const calcTBHK = (sem?: SemesterData) => {
    if (!sem) return null;
    let total = 0;
    let weight = 0;

    scoreTypes.forEach((t) => {
      const list = sem.scoresByType[t.id!] || [];
      const vals = list.map((r) => edited[r.id!] ?? r.score);
      const tb = avg(vals);
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
    for (const id of Object.keys(deleted)) {
      await deleteLearningResult(id);
      setResults((p) => p.filter((x) => x.id !== id));
    }

    for (const [id, v] of Object.entries(edited)) {
      if (v !== original[id]) {
        await updateLearningResult(id, { score: v });
      }
    }

    setEditingKey(null);
    setEdited({});
    setDeleted({});
    toast.success("Đã lưu thay đổi");
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
      {/* HEADER */}
      <h1
        style={{
          fontSize: "2.6rem",
          fontWeight: 900,
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <BookOpen /> Hồ sơ học tập
      </h1>

      {/* SEARCH */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
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
            }}
          />
        </div>
      </div>

      {/* SCORE SCALE */}
      <ScoreScale />

      {grouped.map((g) => {
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
            {/* CARD HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.8rem",
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
                {subject?.name} • Lớp {g.classLevel}
              </div>

              <button
                onClick={() => setEditingKey(editing ? null : key)}
                style={{
                  background: "none",
                  border: "none",
                  fontWeight: 800,
                  color: "#4f46e5",
                  cursor: "pointer",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <Edit size={18} />
                {editing ? "Hủy" : "Sửa điểm"}
              </button>
            </div>

            {/* SEMESTERS */}
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

                    {scoreTypes.map((t) => {
                      const list = semData?.scoresByType[t.id!] || [];
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

                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {list.map((r) => {
                              const score = edited[r.id!] ?? r.score;
                              const faded = deleted[r.id!];

                              return (
                                <div
                                  key={r.id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: 40,
                                    padding: "0 16px",
                                    borderRadius: 999,
                                    background: scoreBg(score),
                                    boxShadow:
                                      "0 8px 18px rgba(15,23,42,0.12)",
                                    fontWeight: 900,
                                    opacity: faded ? 0.45 : 1,
                                  }}
                                >
                                  {editing ? (
                                    <>
                                      <input
                                        type="number"
                                        step={0.1}
                                        min={0}
                                        max={10}
                                        value={score}
                                        onChange={(e) =>
                                          setEdited((p) => ({
                                            ...p,
                                            [r.id!]: Number(e.target.value),
                                          }))
                                        }
                                        style={{
                                          width: 50,
                                          height: 30,
                                          borderRadius: 8,
                                          border: "1px solid #c7d2fe",
                                          textAlign: "center",
                                          fontWeight: 800,
                                        }}
                                      />
                                      <button
                                        onClick={() =>
                                          setDeleted((p) => ({
                                            ...p,
                                            [r.id!]: true,
                                          }))
                                        }
                                        style={{
                                          background: "rgba(15,23,42,0.08)",
                                          border: "none",
                                          borderRadius: 8,
                                          padding: 4,
                                          cursor: "pointer",
                                        }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    score
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

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

            {/* TBCN HERO */}
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
              }}
            >
              <Award style={{ marginRight: 8 }} />
              Trung bình cả năm: {tbc ?? "—"}
            </div>

            {editing && (
              <div style={{ marginTop: 22, textAlign: "right" }}>
                <button
                  onClick={handleSave}
                  style={{
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    padding: "0.7rem 1.6rem",
                    borderRadius: 16,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Save size={18} /> Lưu thay đổi
                </button>
              </div>
            )}
          </div>
        );
      })}

      <ToastContainer />
    </motion.div>
  );
}

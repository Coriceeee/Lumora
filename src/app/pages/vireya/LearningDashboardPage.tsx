// src/app/pages/vireya/LearningDashboardPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import * as Recharts from "recharts";
import { AnimatePresence, motion } from "framer-motion";
import { Check, TrendingUp, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
import {
  getLearningDashboardsByUser,
  addLearningDashboard,
  updateLearningDashboard, // sử dụng service (nếu có)
} from "../../../services/learningDashboardService";
import { getLearningResultsByUser, getAllLearningResults } from "../../../services/learningResultService";
import { getAllSubjects } from "../../../services/subjectService";
import { toast, ToastContainer } from "react-toastify";
import { vireyaDashboardService } from "../../../services/vireyaDashboardService";
import { LearningDashboard } from "../../../types/LearningDashboard";
import "react-toastify/dist/ReactToastify.css";
import classNames from "classnames";
import { KTSVG } from "../../../_start/helpers";
import { Dropdown1 } from "../../../_start/partials";

const {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} = Recharts as unknown as any;

/* ---------- Helpers ---------- */
function colorFromString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  const hue = Math.abs(h) % 360;
  return `linear-gradient(180deg, hsl(${hue} 85% 65% / 1), hsl(${(hue + 20) % 360} 75% 55% / 1))`;
}

function extractScoresForSubject(
  dashboard: any,
  subjectName: string
): { tx: number; gk: number; ck: number; fromInsight: boolean } {
  const fromImportant = dashboard?.importantSubjects?.subjects?.[subjectName];
  if (fromImportant) {
    return {
      tx:
        fromImportant["Thường xuyên"] ??
        fromImportant["TX"] ??
        fromImportant["thuongxuyen"] ??
        0,
      gk: fromImportant["Giữa kỳ"] ?? fromImportant["GK"] ?? 0,
      ck: fromImportant["Cuối kỳ"] ?? fromImportant["CK"] ?? 0,
      fromInsight: false,
    };
  }

  const insights: any[] = Array.isArray(dashboard?.subjectInsights)
    ? dashboard.subjectInsights
    : [];
  const found = insights.find(
    (s) =>
      (s?.subjectName || "").toString().toLowerCase() ===
      subjectName.toLowerCase()
  );
  if (found) {
    const src =
      found.scores ||
      found.marks ||
      found.examScores ||
      found.score ||
      found.results ||
      {};
    const tx =
      src["Thường xuyên"] ??
      src["TX"] ??
      src["thuongxuyen"] ??
      src["thuong_xuyen"] ??
      src["continuous"] ??
      0;
    const gk =
      src["Giữa kỳ"] ?? src["GK"] ?? src["giua_ky"] ?? src["midterm"] ?? 0;
    const ck =
      src["Cuối kỳ"] ?? src["CK"] ?? src["cuoi_ky"] ?? src["final"] ?? 0;

    if (tx || gk || ck) {
      return { tx: Number(tx) || 0, gk: Number(gk) || 0, ck: Number(ck) || 0, fromInsight: true };
    }
  }

  // fallback
  return { tx: 0, gk: 0, ck: 0, fromInsight: true };
}

async function safeUpdateOrCreateDashboard(id: string | undefined, payload: any) {
  const docId = id || "unique_id_string";
  try {
    if (typeof updateLearningDashboard === "function") {
      await updateLearningDashboard(docId, payload);
      return { updated: true, created: false };
    } else {
      await addLearningDashboard({ id: docId, ...payload } as any);
      return { updated: false, created: true };
    }
  } catch (err: any) {
    const msg = String(err?.message || err || "");
    if (msg.includes("No document to update") || msg.toLowerCase().includes("not-found") || msg.toLowerCase().includes("not found")) {
      try {
        await addLearningDashboard({ id: docId, ...payload } as any);
        return { updated: false, created: true };
      } catch (addErr) {
        throw addErr;
      }
    }
    throw err;
  }
}

/* ---------- Small UI component: SubjectTrendCard ---------- */
type SubjectTrendCardProps = {
  p: { delta: number; percent: number; trendLabel: string; last?: number; prev?: number };
  compact?: boolean;
};

const SubjectTrendCard: React.FC<SubjectTrendCardProps> = ({ p, compact = false }) => {
  const up = p.delta > 0.05;
  const down = p.delta < -0.05;
  const percentText = typeof p.percent === "number" ? `${Math.abs(p.percent).toFixed(1)}%` : "N/A";

  return (
    <div style={{ display: "flex", gap: compact ? 8 : 12, alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: compact ? 14 : 18, fontWeight: 900, color: up ? "#16a34a" : down ? "#ef4444" : "#64748b" }}>
          {up ? <ArrowUp size={compact ? 14 : 18} /> : down ? <ArrowDown size={compact ? 14 : 18} /> : <Minus size={compact ? 14 : 18} />}
        </div>
        {!compact && (
          <div style={{ fontSize: 13, fontWeight: 800, color: up ? "#16a34a" : down ? "#ef4444" : "#64748b" }}>{p.trendLabel}</div>
        )}
      </div>

      <div style={{ marginLeft: compact ? 4 : "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {compact ? <div style={{ fontSize: 12, fontWeight: 800, color: up ? "#16a34a" : down ? "#ef4444" : "#64748b" }}>{percentText}</div> : (
          <>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Tiến bộ</div>
            <div style={{ fontWeight: 900, fontSize: 16, color: up ? "#16a34a" : down ? "#ef4444" : "#64748b" }}>{percentText}</div>
          </>
        )}
      </div>
    </div>
  );
};

/* ---------- Component ---------- */
const LearningDashboardPage: React.FC = () => {
  const userId = "user_fake_id_123456"; // test id (thay bằng động nếu cần)
  const [dashboards, setDashboards] = useState<LearningDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [selectedDashboard, setSelectedDashboard] = useState<LearningDashboard | null>(null);

  const [learningResults, setLearningResults] = useState<any[]>([]);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<string | null>(null);

  const loadDashboards = async () => {
    if (!userId) return;
    try {
      const data = await getLearningDashboardsByUser(userId);
      setDashboards(data || []);
      if (data && data.length > 0) {
        setSelectedDashboard(data[0]);
      }
    } catch (err) {
      console.error("loadDashboards lỗi:", err);
      setDashboards([]);
    }
  };

  const loadLearningResults = async () => {
    try {
      const results = await getLearningResultsByUser(userId);
      const final = Array.isArray(results) && results.length > 0 ? results : (await getAllLearningResults());
      setLearningResults(final || []);
    } catch (err) {
      console.error("Lỗi load learning results", err);
      setLearningResults([]);
    }
  };

  useEffect(() => {
    loadDashboards();
    loadLearningResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const dashboardToShow = selectedDashboard || dashboards[0];

  const { subjectsData, anyFallback } = useMemo(() => {
    const data: Array<{ subject: string; "Thường xuyên": number; "Giữa kỳ": number; "Cuối kỳ": number; }> = [];
    if (!dashboardToShow) return { subjectsData: data, anyFallback: false };
    const fb = new Map<string, boolean>();
    const subjectNames = Object.keys(dashboardToShow.importantSubjects?.subjects || {});

    (subjectNames || []).forEach((name) => {
      const { tx, gk, ck, fromInsight } = extractScoresForSubject(dashboardToShow, name);
      data.push({ subject: name, "Thường xuyên": Number(tx) || 0, "Giữa kỳ": Number(gk) || 0, "Cuối kỳ": Number(ck) || 0 });
      fb.set(name, fromInsight);
    });
    return { subjectsData: data, anyFallback: Array.from(fb.values()).some((v) => v) };
  }, [dashboardToShow]);

  const toggleSubject = (idx: number, subjectName?: string) => {
    setExpandedSubjects((prev) => {
      const newSet = new Set(prev);
      const willOpen = !newSet.has(idx);
      if (willOpen) newSet.add(idx);
      else newSet.delete(idx);

      if (willOpen && subjectName) {
        saveProgressForSubject(subjectName).catch((err) => console.error("Lưu tiến bộ thất bại", err));
      }

      return newSet;
    });
  };

  const handleTimelineClick = (dashboard: LearningDashboard) => {
    setSelectedDashboard(dashboard);
  };

  const getShortDesc = (item: any) => {
    const base = item?.suggestion || item?.strength || item?.trend || item?.weakness || "";
    if (!base) return "Không có mô tả ngắn.";
    return base.length > 120 ? base.slice(0, 117) + "..." : base;
  };

  const subjectsFromResults = useMemo(() => {
    const names = Array.from(new Set((learningResults || []).map((r: any) => r.subjectName).filter(Boolean)));
    return names;
  }, [learningResults]);

  function seriesForSubject(subjectName: string) {
    const rows = (learningResults || []).filter((r: any) => (r.subjectName || "").toLowerCase() === (subjectName || "").toLowerCase());
    const normalized = rows.map((r: any) => {
      return {
        semester: r.semester ?? r.period ?? (r.date ? new Date(r.date).toLocaleDateString() : `#${r.id ?? ""}`),
        score: Number(r.score ?? r.mark ?? r.value ?? 0),
      };
    });
    return normalized;
  }

  function computeProgressForSubject(subjectName: string) {
    const serie = seriesForSubject(subjectName);
    if (!serie || serie.length === 0) return { delta: 0, percent: 0, trendLabel: "Chưa đủ dữ liệu" };
    const last = serie[serie.length - 1]?.score ?? 0;
    const prev = serie[serie.length - 2]?.score ?? 0;
    const delta = +(last - prev).toFixed(2);
    let percent = 0;
    if (prev === 0) {
      percent = last === 0 ? 0 : 100;
    } else {
      percent = +(((delta) / (prev || 1)) * 100).toFixed(1);
    }
    let trendLabel = "Ổn định";
    if (delta > 0.05) trendLabel = `Tăng ${Math.abs(percent).toFixed(1)}%`;
    else if (delta < -0.05) trendLabel = `Giảm ${Math.abs(percent).toFixed(1)}%`;

    return { delta, percent, trendLabel, last, prev };
  }

  function currentAverageFromDashboard(subjectName: string) {
    if (!dashboardToShow) return 0;
    const { tx, gk, ck } = extractScoresForSubject(dashboardToShow, subjectName);
    const txN = Number(tx) || 0;
    const gkN = Number(gk) || 0;
    const ckN = Number(ck) || 0;
    const weighted = txN * 0.2 + gkN * 0.3 + ckN * 0.5;
    return Math.round((weighted + Number.EPSILON) * 100) / 100;
  }

  async function saveProgressForSubject(subjectName: string) {
    try {
      const p = computeProgressForSubject(subjectName);
      const docId = (dashboardToShow as any)?.id || "unique_id_string";
      const payload: any = {};
      payload[`subjectProgress.${subjectName}`] = { ...p, updatedAt: new Date() };
      await safeUpdateOrCreateDashboard(docId, payload);
      toast.success(`${subjectName}: Tiến bộ đã được lưu (${Math.abs(p.percent).toFixed(1)}%).`);
    } catch (err) {
      console.error("saveProgressForSubject failed", err);
      toast.error("Không thể lưu tiến bộ.");
      throw err;
    }
  }

  const handleSelectSubjectDetail = async (subjectName: string) => {
    setSelectedSubjectDetail(subjectName);
    try {
      await safeUpdateOrCreateDashboard((dashboardToShow as any)?.id || "unique_id_string", { lastSelected: subjectName });
      toast.success(`Lưu lựa chọn môn chi tiết: ${subjectName}`);
    } catch (err) {
      console.error("Lưu lastSelected thất bại", err);
      toast.error("Lưu lựa chọn thất bại.");
    }
  };

  return (
    <div className="ld-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ld-grid">
        {/* LEFT */}
        <div className="ld-left">
          <div className="ld-left-top">
            <h2 className="ld-title">🧭 Định hướng học tập</h2>
            <button
              onClick={async () => {
                if (!userId) return;
                try {
                  setLoading(true);
                  toast.info("Đang lấy kết quả học tập...");
                  const results = await getLearningResultsByUser(userId);
                  toast.info("Đang phân tích với AI...");
                  const dashboardData = await vireyaDashboardService(results);
                  const dashboardWithMeta = { ...dashboardData, userId, createdAt: new Date() };
                  await addLearningDashboard(dashboardWithMeta as any);
                  toast.success("Phân tích thành công!");
                  await loadDashboards();
                } catch (err: any) {
                  console.error(err);
                  toast.error(err?.status === 429 ? "Hạn mức OpenAI vượt quá." : "Lỗi khi gọi GPT.");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className={`ld-btn ${loading ? "ld-btn--loading" : ""}`}
            >
              {loading ? "Đang tạo..." : "Tạo mới"}
            </button>
          </div>

<div className={`card ${classNames}`}>
  {/* begin::Header */}
  <div className="card-header align-items-center border-0 mt-5">
    <h3 className="card-title align-items-start flex-column">
      <span className="fw-bolder text-dark fs-3">Lịch sử cập nhật</span>
      <span className="text-muted mt-2 fw-bold fs-6">Nhật ký hoạt động</span>
    </h3>
    <div className="card-toolbar">
      <button
        type="button"
        className="btn btn-sm btn-icon btn-color-primary btn-active-light-primary"
        data-kt-menu-trigger="click"
        data-kt-menu-placement="bottom-end"
        data-kt-menu-flip="top-end"
      >
        <KTSVG
          path="/media/icons/duotone/Layout/Layout-4-blocks-2.svg"
          className="svg-icon-1"
        />
      </button>
      <Dropdown1 />
    </div>
  </div>
  {/* end::Header */}

  {/* begin::Body */}
  <div className="card-body pt-3">
    <div className="timeline-label">
      {dashboards.length === 0 && (
        <div className="text-muted fs-7">Chưa có dữ liệu.</div>
      )}

      {dashboards.map((dashboard) => {
        const dateObj: Date | null = dashboard.createdAt
          ? "toDate" in (dashboard as any).createdAt
            ? (dashboard.createdAt as any).toDate()
            : new Date(dashboard.createdAt as any)
          : null;

        const dateStr = dateObj
          ? dateObj.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            })
          : "N/A";

        return (
          <div
            className="timeline-item"
            key={dashboard.id || Math.random().toString()}
            onClick={() => handleTimelineClick(dashboard)}
            style={{ cursor: "pointer" }}
          >
            {/* Label (ngày) */}
            <div className="timeline-label fw-bolder text-gray-800 fs-6">
              {dateStr}
            </div>

            {/* Badge (icon giữa timeline) */}
            <div className="timeline-badge">
              <i className="fa fa-genderless text-success fs-1"></i>
            </div>

            {/* Content */}
            <div className="timeline-content d-flex">
              <span className="fw-bold fs-6 text-dark ps-3">
                {dashboard.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
  {/* end::Body */}
</div>




          <div className="ld-card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>🔎 Kết quả học tập (Chọn để xem chi tiết)</div>
            {subjectsFromResults.length === 0 ? (
              <div className="ld-empty">Chưa có kết quả học tập.</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {subjectsFromResults.map((s) => (
                  <li key={s} style={{ marginBottom: 8 }}>
                    <button className="subject-button-compact" onClick={() => handleSelectSubjectDetail(s)}>
                      {/* show compact progress next to subject name */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontWeight: 700 }}>{s}</div>
                        {(() => {
                          const p = computeProgressForSubject(s);
                          const up = p.delta > 0.05;
                          const down = p.delta < -0.05;
                          const percentText = typeof p.percent === "number" ? `${Math.abs(p.percent).toFixed(1)}%` : "N/A";
                          const color = up ? "#16a34a" : down ? "#ef4444" : "#64748b";
                          return <div style={{ fontSize: 12, fontWeight: 900, color }}>{percentText}</div>;
                        })()}
                      </div>
                      {selectedSubjectDetail === s ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    <AnimatePresence>
                      {selectedSubjectDetail === s && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
                          <div style={{ padding: 12, background: "#fff", borderRadius: 8, marginTop: 8, border: "1px solid rgba(15,23,42,0.04)" }}>
                            {(() => {
                              const insightItem = (dashboardToShow?.subjectInsights || []).find((it: any) => (it?.subjectName || "").toString().toLowerCase() === (s || "").toLowerCase());
                              if (insightItem) {
                                return (
                                  <div>
                                    <p style={{ margin: "6px 0" }}><TrendingUp size={14} /> <strong>{insightItem.trend || "Không có xu hướng"}</strong></p>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                                      <div style={{ minWidth: 150 }}>
                                        <div style={{ fontWeight: 700 }}>Điểm mạnh</div>
                                        <div style={{ color: "#475569" }}>{insightItem.strength || "Chưa có"}</div>
                                      </div>
                                      <div style={{ minWidth: 150 }}>
                                        <div style={{ fontWeight: 700 }}>Điểm yếu</div>
                                        <div style={{ color: "#475569" }}>{insightItem.weakness || "Chưa có"}</div>
                                      </div>
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                      <div style={{ fontWeight: 700 }}>Gợi ý</div>
                                      <div style={{ color: "#475569" }}>{insightItem.suggestion || "Chưa có gợi ý cụ thể."}</div>
                                    </div>
                                  </div>
                                );
                              } else {
                                return <div style={{ fontStyle: "italic", color: "#64748b" }}>Chưa có phân tích AI cho môn này — đang hiển thị biểu đồ điểm gốc nếu có.</div>;
                              }
                            })()}

                            {/* --- NEW: Chi tiết điểm và Tiến bộ --- */}
                            <div style={{ marginTop: 12 }} className="ld-subject-detail">
                              <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                                <div style={{ minWidth: 220 }}>
                                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Chi tiết điểm</div>
                                  {/* Lấy TX/GK/CK từ dashboard hoặc insight */}
                                  {(() => {
                                    const scores = extractScoresForSubject(dashboardToShow, s);
                                    const avg = currentAverageFromDashboard(s);
                                    return (
                                      <div>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                                          <div style={{ minWidth: 82 }}><div style={{ fontSize: 12, color: "#94a3b8" }}>Thường xuyên</div><div style={{ fontWeight: 700 }}>{scores.tx ?? 0}</div></div>
                                          <div style={{ minWidth: 82 }}><div style={{ fontSize: 12, color: "#94a3b8" }}>Giữa kỳ</div><div style={{ fontWeight: 700 }}>{scores.gk ?? 0}</div></div>
                                          <div style={{ minWidth: 82 }}><div style={{ fontSize: 12, color: "#94a3b8" }}>Cuối kỳ</div><div style={{ fontWeight: 700 }}>{scores.ck ?? 0}</div></div>
                                        </div>

                                        <div style={{ marginTop: 6 }}>
                                          <div style={{ fontSize: 12, color: "#94a3b8" }}>Điểm trung bình (trọng số TX20/GK30/CK50)</div>
                                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                                            <div style={{ flex: 1, background: "#eef2ff", height: 12, borderRadius: 8, overflow: "hidden" }}>
                                              <div style={{ width: `${Math.min(100, (avg / 10) * 100)}%`, height: "100%", background: "linear-gradient(90deg,#60a5fa,#06b6d4)" }} />
                                            </div>
                                            <div style={{ minWidth: 48, textAlign: "right", fontWeight: 700 }}>{avg ?? 0}/10</div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>

                                <div style={{ flex: 1, minWidth: 200 }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    {/* show subject name + small progress badge beside it */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                      {(() => {
                                        const p = computeProgressForSubject(s);
                                        const up = p.delta > 0.05;
                                        const down = p.delta < -0.05;
                                        const percentText = typeof p.percent === "number" ? `${Math.abs(p.percent).toFixed(1)}%` : "N/A";
                                        const color = up ? "#16a34a" : down ? "#ef4444" : "#64748b";
                                        return (
                                          <>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>{s}</div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color }}>{percentText}</div>
                                          </>
                                        );
                                      })()}
                                    </div>

                                    {/* single IIFE returning trend + percent (fixed structure) */}
                                    {(() => {
                                      const p = computeProgressForSubject(s);
                                      return <SubjectTrendCard p={p} />;
                                    })()}
                                  </div>

                                  <div style={{ marginTop: 8 }}>
                                    {(seriesForSubject(s) || []).length > 0 ? (
                                      <div style={{ height: 90 }}>
                                        <ResponsiveContainer width="100%" height={90}>
                                          <LineChart data={seriesForSubject(s)}>
                                            <XAxis dataKey="semester" hide />
                                            <YAxis domain={[0, 10]} hide />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={false} />
                                          </LineChart>
                                        </ResponsiveContainer>
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: 13, color: "#64748b" }}>Không có dữ liệu điểm lịch sử.</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {(seriesForSubject(s) || []).length > 0 ? (
                              <div style={{ marginTop: 8 }}>
                                <ResponsiveContainer width="100%" height={220}>
                                  <LineChart data={seriesForSubject(s)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="semester" tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>Không có dữ liệu điểm để vẽ biểu đồ.</div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="ld-right">
          {dashboardToShow ? (
            <>
              <div className="ld-card">
                <div className="ld-section-title">📊 Đánh giá chung </div>
                <p className="ld-overview">{dashboardToShow.summary || "Không có mô tả chung."}</p>
              </div>

              <div className="ld-card">
                <div className="ld-section-title">🎯 Các môn chủ chốt</div>

                {subjectsData.length > 0 ? (
                  <div className="ld-infobox">
                    <div className="ld-chart-wrap">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={subjectsData} margin={{ top: 18, right: 20, left: 0, bottom: 6 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Legend verticalAlign="top" />
                          <Bar dataKey="Thường xuyên" fill="#4f46e5" />
                          <Bar dataKey="Giữa kỳ" fill="#22c55e" />
                          <Bar dataKey="Cuối kỳ" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {anyFallback && (
                      <div className="ld-fallback-note">
                        Một số môn chưa có dữ liệu trong phân tích quan trọng. Biểu đồ đang hiển thị từ dữ liệu tổng hợp (fallback) hoặc mặc định 0.
                      </div>
                    )}

                    <div className="ld-rows3">
                      <div className="ld-col">
                        <div className="ld-col-title">Điểm mạnh</div>
                        <div className="ld-col-text">{dashboardToShow.importantSubjects?.overallStrengths || "Chưa có dữ liệu"}</div>
                      </div>
                      <div className="ld-col">
                        <div className="ld-col-title">Điểm yếu</div>
                        <div className="ld-col-text">{dashboardToShow.importantSubjects?.overallWeaknesses || "Chưa có dữ liệu"}</div>
                      </div>
                      <div className="ld-col">
                        <div className="ld-col-title">Chiến lược</div>
                        <div className="ld-col-text">{dashboardToShow.importantSubjects?.learningAdvice || "Chưa có dữ liệu"}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="ld-empty italic">Chưa có dữ liệu để hiển thị. Hãy chọn tối đa 3 môn chủ chốt.</p>
                )}
              </div>

              <div className="ld-card">
                <div className="ld-section-title">📚 Đánh giá kết quả & Đề xuất kế hoạch từng môn </div>

                {dashboardToShow.subjectInsights && dashboardToShow.subjectInsights.length > 0 ? (
                  dashboardToShow.subjectInsights.map((item: any, idx: number) => {
                    const expanded = expandedSubjects.has(idx);
                    const leftMarkStyle = { background: colorFromString(item?.subjectName || String(idx)) };
                    return (
                      <div key={idx} className={`ld-accordion ${expanded ? "ld-accordion--open" : ""}`}>
                        <div className="ld-accordion-head" onClick={() => toggleSubject(idx, item?.subjectName)} role="button" aria-expanded={expanded} tabIndex={0} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") toggleSubject(idx, item?.subjectName); }}>
                          <div className="ld-leftmark" style={leftMarkStyle as any} />
                          <div className="ld-acc-main">
                            {/* show subject name with small progress badge next to it */}
                            <div className="ld-acc-title">
                              {(() => {
                                const sub = item?.subjectName || "";
                                const p = computeProgressForSubject(sub);
                                const up = p.delta > 0.05;
                                const down = p.delta < -0.05;
                                const percentText = typeof p.percent === "number" ? `${Math.abs(p.percent).toFixed(1)}%` : "N/A";
                                const color = up ? "#16a34a" : down ? "#ef4444" : "#64748b";
                                return (
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ fontSize: 16, fontWeight: 700 }}>{sub}</div>
                                    <div style={{ fontSize: 12, fontWeight: 800, color }}>{percentText}</div>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="ld-acc-short">{getShortDesc(item)}</div>
                          </div>
                          <div className="ld-acc-right">
                            <div className="ld-acc-hint">{item?.trend ? "Xu hướng" : ""}</div>
                            <div className={`ld-chevron ${expanded ? "ld-chevron--open" : ""}`}>▶</div>
                          </div>
                        </div>

                        {expanded && (
                          <div className="ld-accordion-body">
                            <div className="ld-badge-row">
                              <div className="ld-badge">
                                <TrendingUp size={14} />
                                <span className="ld-badge-label">Xu hướng</span>
                              </div>
                              <strong className="ld-trend">{item?.trend || "Không có"}</strong>
                            </div>

                            <div className="ld-two">
                              <div className="ld-field">
                                <div className="ld-field-title">Điểm mạnh</div>
                                <div className="ld-field-text">{item?.strength || "Chưa có"}</div>
                              </div>
                              <div className="ld-field">
                                <div className="ld-field-title">Điểm yếu</div>
                                <div className="ld-field-text">{item?.weakness || "Chưa có"}</div>
                              </div>
                            </div>

                            <div className="ld-field">
                              <div className="ld-field-title">Gợi ý</div>
                              <div className="ld-field-text">{item?.suggestion || "Chưa có gợi ý cụ thể."}</div>
                            </div>

                            <div className="ld-actions">
                              <button className="ld-btn" onClick={() => toast.info(`Mở đề xuất hành động cho ${item?.subjectName}`)}>Gợi ý hành động</button>
                              <button className="ld-btn ld-btn--ghost" onClick={() => toast.info(`Sao chép tóm tắt ${item?.subjectName}`)}>Sao chép tóm tắt</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="ld-empty">Không có dữ liệu phân tích môn học.</p>
                )}
              </div>
            </>
          ) : (
            <p className="ld-empty">Chưa có phân tích nào.</p>
          )}
        </div>
      </div>

      {/* CSS inline */}
      <style>{`
/* Container */
.ld-container { max-width: 1200px; margin: 0 auto; padding: 20px; color: #222; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.ld-grid { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
.ld-left { width: 100%; max-width: 360px; }
.ld-right { flex: 1; min-width: 520px; }

/* Buttons */
.ld-btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; background: #4f46e5; color: #fff; font-weight: 600; transition: background-color .25s ease, opacity .2s ease; }
.ld-btn:hover { background: #4338ca; }
.ld-btn--loading { background: #a5b4fc; cursor: not-allowed; }
.ld-btn--light { background: #e2e8f0; color: #0f172a; font-weight: 700; }
.ld-btn--light:hover { background: #cbd5e1; }
.ld-btn--ghost { background: #fff; color: #0f172a; border: 1px solid rgba(15,23,42,0.12); }
.ld-btn--ghost:hover { background: #f8fafc; }

/* Cards */
.ld-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin-bottom: 30px; border: 1px solid rgba(15,23,42,0.03); }
.ld-card--tight { padding: 12px; }

/* Titles & texts */
.ld-title { margin: 0; font-size: 20px; }
.ld-section-title { font-size: 22px; font-weight: 700; margin-bottom: 16px; color: #0f172a; display: flex; align-items: center; gap: 10px; }
.ld-overview { font-size: 16px; line-height: 1.6; margin: 0; color: #334155; }
.ld-empty { color: #64748b; }

/* Left top row */
.ld-left-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }

.ld-timeline-list { margin-top: 12px; }
.ld-timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 10px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid rgba(15,23,42,0.06);
  transition: background 0.2s ease, border-color 0.2s ease;
}
.ld-timeline-item:hover { border-color: rgba(79,70,229,0.18); }
.ld-timeline-item--active {
  background: linear-gradient(90deg, rgba(79,70,229,0.06), rgba(34,197,94,0.02));
  border-color: rgba(79,70,229,0.22);
}
.ld-dot {
  width: 12px; height: 12px; border-radius: 999px;
  background: #34d399; margin-top: 4px; flex-shrink: 0;
}
.timeline-content { display: flex; flex-direction: column; }
.timeline-content span:first-child { font-weight: 700; color: #062173; }
timeline-content span:last-child { color: #64748b; font-size: 12px; }


.ld-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #34d399;
  margin-top: 4px;
  flex-shrink: 0;
}

.ld-timeline-item-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.ld-timeline-item-date {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
}

.ld-timeline-item-title {
  font-size: 14px;
  font-weight: 700;
  color: #062173;
}

/* Compact subject button (left list) */
.subject-button-compact { width: 100%; text-align: left; padding: 10px 12px; background: #f8fafc; border: none; outline: none; cursor: pointer; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }

/* Key subjects */
.ld-keyrow { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.ld-keyrow-info { color: #64748b; font-size: 13px; }

/* Selector */
.ld-selector { position: relative; padding: 12px; border-radius: 12px; border: 1px solid rgba(15,23,42,0.06); background: #fff; box-shadow: 0 8px 30px rgba(2,6,23,0.06); margin-bottom: 12px; }
.ld-selector-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.ld-selector-list { display: flex; gap: 12px; flex-wrap: wrap; }
.ld-subject-chip { display: flex; align-items: center; gap: 8px; border: 1px dashed rgba(2,6,23,0.06); padding: 8px 10px; border-radius: 10px; cursor: pointer; user-select: none; transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease, background .15s ease; }
.ld-subject-chip:hover { box-shadow: 0 6px 18px rgba(2,6,23,0.06); }
.ld-subject-chip--checked { border: 1px solid rgba(79,70,229,0.25); background: rgba(79,70,229,0.06); }
.ld-subject-chip-label { font-size: 13px; font-weight: 700; }

/* Infobox + chart */
.ld-infobox { background: #f8fafc; padding: 16px; border-radius: 10px; margin-bottom: 12px; box-shadow: inset 0 0 10px rgba(99,102,241,0.03); color: #0f172a; }
.ld-chart-wrap { width: 100%; height: 300px; }
.ld-fallback-note { font-size: 12px; color: #64748b; margin-top: 6px; margin-bottom: 6px; }

/* 3 columns info */
.ld-rows3 { display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
.ld-col { min-width: 200px; }
.ld-col-title { font-size: 13px; color: #0f172a; font-weight: 700; margin-bottom: 2px; }
.ld-col-text { color: #475569; }

/* Accordion */
.ld-accordion { margin-bottom: 12px; border-radius: 12px; overflow: hidden; transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease, background .15s ease; border: 1px solid rgba(15,23,42,0.03); background: #fff; box-shadow: 0 6px 18px rgba(2,6,23,0.04); }
.ld-accordion--open { transform: translateY(-2px); border: 1px solid rgba(79,70,229,0.14); background: linear-gradient(180deg, rgba(255,255,255,1), rgba(249,250,251,1)); box-shadow: 0 10px 30px rgba(2,6,23,0.06); }
.ld-accordion-head { display: flex; gap: 12px; align-items: center; padding: 14px 16px; cursor: pointer; user-select: none; }
.ld-leftmark { width: 8px; height: 48px; border-radius: 8px; margin-right: 4px; flex-shrink: 0; }
.ld-acc-main { flex: 1; min-width: 0; }
.ld-acc-title { font-size: 16px; font-weight: 700; margin: 0; color: #07113a; display: flex; align-items: center; gap: 8px; }
.ld-acc-short { margin-top: 4px; font-size: 13px; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%; }
.ld-acc-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.ld-acc-hint { font-size: 12px; color: #94a3b8; }
.ld-chevron { display: inline-block; transition: transform .25s ease; font-size: 14px; color: #334155; }
.ld-chevron--open { transform: rotate(90deg); }

.ld-accordion-body { padding: 16px; border-top: 1px solid rgba(15,23,42,0.06); background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(249,250,251,0.95)); font-size: 14px; color: #334155; line-height: 1.6; }
.ld-badge-row { margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.ld-badge { display: inline-flex; align-items: center; gap: 6px; background: #eef2ff; color: #3730a3; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.ld-badge-label { font-weight: 700; }
.ld-trend { margin-left: 6px; }

.ld-two { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
.ld-field { min-width: 180px; }
.ld-field-title { font-size: 13px; font-weight: 700; }
.ld-field-text { color: #475569; }

.ld-actions { display: flex; gap: 8px; margin-top: 8px; }

/* subject detail */
.ld-subject-detail { margin-top: 8px; }

@media (max-width: 900px) { .ld-grid { flex-direction: column; } }
      `}</style>
    </div>
  );
};

export default LearningDashboardPage;

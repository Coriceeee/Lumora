// src/app/pages/vireya/LearningDashboardPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import * as Recharts from "recharts";
import { AnimatePresence, motion } from "framer-motion";
import { Check, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
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

/**
 * Cố gắng lấy điểm cho 1 môn từ nhiều nơi:
 * - importantSubjects.subjects[subject]
 * - subjectInsights[*].scores / marks / examScores (nếu có)
 * Nếu không có thì trả 0 và đánh dấu fallback.
 */
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

/**
 * Wrapper cập nhật dashboard:
 * - Nếu service updateLearningDashboard có sẵn -> gọi nó
 * - Nếu lỗi "not found" hoặc update thất bại -> gọi addLearningDashboard để tạo (id mặc định "unique_id_string")
 */
async function safeUpdateOrCreateDashboard(id: string | undefined, payload: any) {
  const docId = id || "unique_id_string";
  try {
    if (typeof updateLearningDashboard === "function") {
      // gọi service update (nên dùng try/catch khi service dùng updateDoc và document không tồn tại)
      await updateLearningDashboard(docId, payload);
      return { updated: true, created: false };
    } else {
      // nếu service không tồn tại, fallback tạo document mới
      await addLearningDashboard({ id: docId, ...payload } as any);
      return { updated: false, created: true };
    }
  } catch (err: any) {
    const msg = String(err?.message || err || "");
    // nếu lỗi do doc không tồn tại -> tạo mới
    if (msg.includes("No document to update") || msg.toLowerCase().includes("not-found") || msg.toLowerCase().includes("not found")) {
      try {
        await addLearningDashboard({ id: docId, ...payload } as any);
        return { updated: false, created: true };
      } catch (addErr) {
        throw addErr;
      }
    }
    // nếu lỗi khác -> rethrow để xử lý caller
    throw err;
  }
}

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
    const subjectNames = Object.keys(dashboardToShow.importantSubjects.subjects);

    (subjectNames || []).forEach((name) => {
      const { tx, gk, ck, fromInsight } = extractScoresForSubject(dashboardToShow, name);
      data.push({ subject: name, "Thường xuyên": Number(tx) || 0, "Giữa kỳ": Number(gk) || 0, "Cuối kỳ": Number(ck) || 0 });
      fb.set(name, fromInsight);
    });
    return { subjectsData: data, anyFallback: Array.from(fb.values()).some((v) => v) };
  }, [dashboardToShow]);

  const toggleSubject = (idx: number) => {
    setExpandedSubjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) newSet.delete(idx);
      else newSet.add(idx);
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

          <div className="ld-card ld-card--tight">
            <div className="ld-timeline-head">
              <div className="ld-timeline-title">Timeline</div>
              <div className="ld-timeline-sub">Các lần phân tích trước</div>
            </div>

            <div className="ld-timeline-list">
              {dashboards.length === 0 && <div className="ld-empty">Chưa có dữ liệu.</div>}
              {dashboards.map((dashboard) => {
                const key = dashboard.createdAt?.toString() || Math.random().toString();
                const dateObj: Date | null = dashboard.createdAt ? ("toDate" in (dashboard as any).createdAt ? (dashboard.createdAt as any).toDate() : new Date(dashboard.createdAt as any)) : null;
                const dateStr = dateObj ? dateObj.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "N/A";
                const active = selectedDashboard && selectedDashboard.id === dashboard.id;
                return (
                  <div key={key} onClick={() => handleTimelineClick(dashboard)} className={`ld-timeline-item ${active ? "ld-timeline-item--active" : ""}`}>
                    <div className="ld-dot" />
                    <div className="ld-timeline-item-title">{dashboard.title}</div>
                    <div className="ld-timeline-item-date">{dateStr}</div>
                  </div>
                );
              })}
            </div>
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
                      <div style={{ fontWeight: 700 }}>{s}</div>
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
                        <div className="ld-accordion-head" onClick={() => toggleSubject(idx)} role="button" aria-expanded={expanded} tabIndex={0} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") toggleSubject(idx); }}>
                          <div className="ld-leftmark" style={leftMarkStyle as any} />
                          <div className="ld-acc-main">
                            <div className="ld-acc-title">{item?.subjectName}</div>
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

/* Timeline */
.ld-timeline-head { margin-bottom: 8px; }
.ld-timeline-title { font-weight: 800; color: #062173; }
.ld-timeline-sub { font-size: 13px; color: #64748b; }

.ld-timeline-list { margin-top: 8px; }
.ld-timeline-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 8px; border-radius: 10px; cursor: pointer;
  margin-bottom: 8px; background: transparent;
  border: 1px solid rgba(15,23,42,0.03);
  transition: background .2s ease, border-color .2s ease;
}
.ld-timeline-item:hover { border-color: rgba(79,70,229,0.18); }
.ld-timeline-item--active { background: linear-gradient(90deg, rgba(79,70,229,0.06), rgba(34,197,94,0.02)); border-color: rgba(79,70,229,0.22); }
.ld-dot { width: 10px; height: 10px; border-radius: 999px; background: #34d399; flex-shrink: 0; }
.ld-timeline-item-title { font-size: 13px; font-weight: 700; }
.ld-timeline-item-date { margin-left: auto; font-size: 12px; color: #64748b; }

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
.ld-acc-title { font-size: 16px; font-weight: 700; margin: 0; color: #07113a; }
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

@media (max-width: 900px) { .ld-grid { flex-direction: column; } }
      `}</style>
    </div>
  );
};

export default LearningDashboardPage;

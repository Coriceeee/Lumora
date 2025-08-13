// src/app/pages/vireya/LearningDashboardPage.tsx
import React, { useEffect, useState } from "react";
import * as Recharts from "recharts";
import { AnimatePresence, motion } from "framer-motion";
import { Check, TrendingUp } from "lucide-react";
import { getLearningDashboardsByUser, addLearningDashboard, updateLearningDashboard } from "../../../services/learningDashboardService";
import { getLearningResultsByUser } from "../../../services/learningResultService";
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
} = Recharts as unknown as {
  ResponsiveContainer: React.FC<any>;
  BarChart: React.FC<any>;
  Bar: React.FC<any>;
  Legend: React.FC<any>;
  XAxis: React.FC<any>;
  YAxis: React.FC<any>;
  CartesianGrid: React.FC<any>;
  Tooltip: React.FC<any>;
};

const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#222",
  },
  button: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#4f46e5",
    color: "white",
    fontWeight: 600,
    transition: "background-color 0.3s",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    marginBottom: 30,
    border: "1px solid rgba(15,23,42,0.03)",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 16,
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  overviewText: {
    fontSize: 16,
    lineHeight: 1.6,
    marginBottom: 16,
    color: "#334155",
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
    boxShadow: "inset 0 0 10px rgba(99,102,241,0.03)",
    color: "#0f172a",
  },
  subjectAccordionItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
  subjectHeader: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: "14px 16px",
    cursor: "pointer",
    userSelect: "none" as const,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
    color: "#07113a",
  },
  subjectShort: {
    marginTop: 4,
    fontSize: 13,
    color: "#475569",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    maxWidth: "70%",
  },
  subjectContent: {
    padding: 16,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(249,250,251,0.95))",
    fontSize: 14,
    color: "#334155",
    lineHeight: 1.6,
    borderTop: "1px solid rgba(15,23,42,0.04)",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    marginRight: 8,
    marginBottom: 8,
  },
  rightIconBox: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  chevron: {
    display: "inline-block",
    transition: "transform 0.25s ease",
    fontSize: 14,
    color: "#334155",
  },
  subjectLeftMark: {
    width: 8,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    flexShrink: 0,
  },
  faded: { color: "#94a3b8" },

  // selector styles
  subjectSelectorBox: {
    position: "relative" as const,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.06)",
    background: "#fff",
    boxShadow: "0 8px 30px rgba(2,6,23,0.06)",
    marginBottom: 12,
  },
  subjectItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px dashed rgba(2,6,23,0.03)",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    userSelect: "none" as const,
  },
  selectedItem: {
    border: "1px solid rgba(79,70,229,0.2)",
    backgroundColor: "rgba(79,70,229,0.04)",
  },
  subjectLabel: {
    fontSize: 13,
    fontWeight: 700,
  },
};

function colorFromString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  const hue = Math.abs(h) % 360;
  return `linear-gradient(180deg, hsl(${hue} 85% 65% / 1), hsl(${(hue + 20) % 360} 75% 55% / 1))`;
}

const LearningDashboardPage: React.FC = () => {
  const userId = "user_fake_id_123456"; // test id
  const [dashboards, setDashboards] = useState<LearningDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [selectedDashboard, setSelectedDashboard] = useState<LearningDashboard | null>(null);

  // main state for selected key subjects (source of truth in UI)
  const [selectedKeySubjects, setSelectedKeySubjects] = useState<string[]>([]);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [allSubjects, setAllSubjects] = useState<string[]>([]);

  const loadDashboards = async () => {
    if (!userId) return;
    const data = await getLearningDashboardsByUser(userId);
    setDashboards(data || []);
    if (data && data.length > 0) {
      setSelectedDashboard(data[0]);
      // read any saved selectedKeySubjects from the fetched dashboard (use as any to avoid TS errors if type not updated)
      setSelectedKeySubjects(((data[0] as any)?.selectedKeySubjects as string[]) || []);
    }
  };

  const loadAllSubjects = async () => {
    try {
      const subjects = await getAllSubjects(); // Subject[]
      // map to names to match UI expectations (string[])
      const names = Array.isArray(subjects) ? subjects.map((s: any) => s?.name ?? String(s)) : [];
      setAllSubjects(names);
    } catch (err) {
      console.error("Lỗi load subjects", err);
      setAllSubjects([]);
    }
  };

  const handleCreateDashboard = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      toast.info("Đang lấy kết quả học tập...");

      const results = await getLearningResultsByUser(userId);

      toast.info("Đang phân tích với AI...");
      const dashboardData = await vireyaDashboardService(results);

      const dashboardWithMeta = {
        ...dashboardData,
        userId,
        createdAt: new Date(),
        // ensure dashboard stored has the field (service may set Timestamp.now())
        selectedKeySubjects: [],
      };

      await addLearningDashboard(dashboardWithMeta as any);
      toast.success("Phân tích thành công!");

      await loadDashboards();
    } catch (err: any) {
      if (err?.status === 429) {
        toast.error("Bạn đã vượt quá hạn mức sử dụng OpenAI. Vui lòng thử lại sau hoặc nâng cấp tài khoản.");
      } else {
        toast.error("Đã xảy ra lỗi khi gọi GPT.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboards();
    loadAllSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // derive dashboardToShow
  const dashboardToShow = selectedDashboard || dashboards[0];

  // sync selectedKeySubjects when we switch dashboards
  useEffect(() => {
    if (!dashboardToShow) {
      setSelectedKeySubjects([]);
      return;
    }
    const saved = (dashboardToShow as any)?.selectedKeySubjects as string[] | undefined;
    setSelectedKeySubjects(saved || []);
  }, [dashboardToShow?.id]);

  const subjectsData = dashboardToShow?.importantSubjects
    ? Object.entries(dashboardToShow.importantSubjects.subjects)
        .filter(([subjectName]) => selectedKeySubjects.includes(subjectName))
        .map(([subjectName, scores]) => ({
          subject: subjectName,
          "Thường xuyên": scores["Thường xuyên"] ?? 0,
          "Giữa kỳ": scores["Giữa kỳ"] ?? 0,
          "Cuối kỳ": scores["Cuối kỳ"] ?? 0,
        }))
    : [];

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
    // sync selectedKeySubjects from dashboard if available
    setSelectedKeySubjects(((dashboard as any)?.selectedKeySubjects as string[]) || []);
  };

  const handleSelectSubject = async (subjectName: string) => {
    if (!dashboardToShow) {
      toast.info("Chưa chọn dashboard để lưu.");
      return;
    }

    // use UI state as source of truth
    let selected = selectedKeySubjects.slice();

    if (selected.includes(subjectName)) {
      selected = selected.filter((s: string) => s !== subjectName);
    } else {
      if (selected.length >= 3) {
        toast.info("Chỉ được chọn tối đa 3 môn!");
        return;
      }
      selected = [...selected, subjectName];
    }

    try {
      // Thử update trước
      await updateLearningDashboard((dashboardToShow as any).id, {
        selectedKeySubjects: selected,
      } as any);

      // Update local state
      setSelectedKeySubjects(selected);
      setDashboards((prev) =>
        prev.map((d) =>
          d.id === (dashboardToShow as any).id
            ? ({ ...(d as any), selectedKeySubjects: selected } as any)
            : d
        )
      );
      setSelectedDashboard((prev) =>
        prev && prev.id === (dashboardToShow as any).id
          ? ({ ...(prev as any), selectedKeySubjects: selected } as any)
          : prev
      );

      toast.success("Lưu môn chủ chốt thành công.");
    } catch (err: any) {
      // Nếu lỗi document chưa tồn tại, tạo mới
      const msg = String(err?.message || err);
      console.warn("updateLearningDashboard lỗi, thử tạo mới nếu chưa có document:", msg);

      if (msg.includes("No document to update") || msg.toLowerCase().includes("not-found")) {
        try {
          await addLearningDashboard({
            id: (dashboardToShow as any).id, // nếu service hỗ trợ
            selectedKeySubjects: selected,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any);

          // Update local state sau khi tạo mới
          setSelectedKeySubjects(selected);
          setDashboards((prev) =>
            prev.map((d) =>
              d.id === (dashboardToShow as any).id
                ? ({ ...(d as any), selectedKeySubjects: selected } as any)
                : d
            )
          );
          setSelectedDashboard((prev) =>
            prev && prev.id === (dashboardToShow as any).id
              ? ({ ...(prev as any), selectedKeySubjects: selected } as any)
              : prev
          );

          toast.success("Tạo mới dashboard và lưu môn chủ chốt thành công.");
        } catch (addErr) {
          console.error("Tạo mới dashboard thất bại", addErr);
          toast.error("Lưu thất bại. Kiểm tra console.");
        }
      } else {
        console.error("Lưu selectedKeySubjects thất bại", err);
        toast.error("Lưu môn chủ chốt thất bại.");
      }
    }
  };

  const getShortDesc = (item: any) => {
    const base = item?.suggestion || item?.strength || item?.trend || item?.weakness || "";
    if (!base) return "Không có mô tả ngắn.";
    return base.length > 120 ? base.slice(0, 117) + "..." : base;
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Timeline (left column) */}
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>🧭 Định hướng học tập</h2>
            <button
              onClick={handleCreateDashboard}
              disabled={loading}
              style={{
                ...styles.button,
                backgroundColor: loading ? "#a5b4fc" : "#4f46e5",
                cursor: loading ? "not-allowed" : "pointer",
                padding: "6px 10px",
                fontSize: 13,
              }}
            >
              {loading ? "Đang tạo..." : "Tạo mới"}
            </button>
          </div>

          <div style={{ ...styles.card, padding: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 800, color: "#062173" }}>Timeline</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Các lần phân tích trước</div>
            </div>

            <div style={{ marginTop: 8 }}>
              {dashboards.length === 0 && <div style={{ color: "#94a3b8" }}>Chưa có dữ liệu.</div>}
              {dashboards.map((dashboard) => {
                const key = dashboard.createdAt?.toString() || Math.random().toString();
                const dateObj: Date | null = dashboard.createdAt
                  ? "toDate" in dashboard.createdAt
                    ? (dashboard.createdAt as any).toDate()
                    : new Date(dashboard.createdAt as any)
                  : null;
                const dateStr = dateObj ? dateObj.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "N/A";
                return (
                  <div
                    key={key}
                    onClick={() => handleTimelineClick(dashboard)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 8px",
                      borderRadius: 10,
                      cursor: "pointer",
                      marginBottom: 8,
                      background: selectedDashboard && selectedDashboard.id === dashboard.id ? "linear-gradient(90deg, rgba(79,70,229,0.06), rgba(34,197,94,0.02))" : "transparent",
                      border: "1px solid rgba(15,23,42,0.03)",
                    }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: "#34d399", flexShrink: 0 }} />
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{dashboard.title}</div>
                    <div style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>{dateStr}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column (main content) */}
        <div style={{ flex: 1, minWidth: 520 }}>
          {dashboardToShow ? (
            <>
              {/* Phân tích chung */}
              <div style={styles.card}>
                <div style={styles.sectionTitle}>📊 Phân tích chung</div>
                <p style={styles.overviewText}>{dashboardToShow.summary || "Không có mô tả chung."}</p>
              </div>

              {/* Phân tích 3 môn chủ chốt */}
              <div style={styles.card}>
                <div style={styles.sectionTitle}>🎯 Phân tích 3 môn chủ chốt</div>

                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <button style={{ ...styles.button }} onClick={() => setShowSubjectSelector((s) => !s)}>
                    {showSubjectSelector ? "Đóng chọn môn" : "Chọn môn chủ chốt"}
                  </button>
                  <div style={{ color: "#64748b", fontSize: 13 }}>
                    {selectedKeySubjects.length > 0 ? `Đã chọn: ${selectedKeySubjects.join(", ")}` : "Chưa chọn môn. Vui lòng chọn tối đa 3 môn."}
                  </div>
                </div>

                <AnimatePresence>
                  {showSubjectSelector && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} style={styles.subjectSelectorBox}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <strong>Chọn tối đa 3 môn</strong>
                        <button onClick={() => setShowSubjectSelector(false)} style={{ ...styles.button, backgroundColor: "#e2e8f0", color: "#0f172a", padding: "6px 10px", fontWeight: 700 }}>
                          Đóng
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {(allSubjects.length > 0 ? allSubjects : Object.keys(dashboardToShow.importantSubjects?.subjects || {})).map((subjectName) => {
                          const checked = selectedKeySubjects.includes(subjectName);
                          return (
                            <motion.div
                              key={subjectName}
                              style={{ ...(styles.subjectItem as any), ...(checked ? (styles.selectedItem as any) : {}) }}
                              whileHover={{ scale: 1.04 }}
                              onClick={() => handleSelectSubject(subjectName)}
                            >
                              {checked ? <Check size={16} color="#4f46e5" /> : <div style={{ width: 16 }} />}
                              <span style={styles.subjectLabel}>{subjectName}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {subjectsData.length > 0 ? (
                  <div style={styles.infoBox}>
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

                    <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 200 }}>
                        <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>Điểm mạnh</div>
                        <div style={{ color: "#475569" }}>{dashboardToShow.importantSubjects?.overallStrengths || "Chưa có dữ liệu"}</div>
                      </div>
                      <div style={{ minWidth: 200 }}>
                        <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>Điểm yếu</div>
                        <div style={{ color: "#475569" }}>{dashboardToShow.importantSubjects?.overallWeaknesses || "Chưa có dữ liệu"}</div>
                      </div>
                      <div style={{ minWidth: 240 }}>
                        <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>Chiến lược</div>
                        <div style={{ color: "#475569" }}>{dashboardToShow.importantSubjects?.learningAdvice || "Chưa có dữ liệu"}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontStyle: "italic", color: "#64748b" }}>Chưa có dữ liệu để hiển thị. Hãy chọn tối đa 3 môn chủ chốt.</p>
                )}
              </div>

              {/* Phân tích từng môn - improved UI */}
              <div style={styles.card}>
                <div style={styles.sectionTitle}>📚 Phân tích từng môn</div>

                {dashboardToShow.subjectInsights && dashboardToShow.subjectInsights.length > 0 ? (
                  dashboardToShow.subjectInsights.map((item: any, idx: number) => {
                    const expanded = expandedSubjects.has(idx);
                    const leftMarkStyle = { ...styles.subjectLeftMark, background: colorFromString(item.subjectName || String(idx)) };
                    return (
                      <div
                        key={idx}
                        style={{
                          ...styles.subjectAccordionItem,
                          boxShadow: expanded ? "0 10px 30px rgba(2,6,23,0.06)" : "0 6px 18px rgba(2,6,23,0.04)",
                          transform: expanded ? "translateY(-4px)" : "translateY(0)",
                          border: expanded ? "1px solid rgba(79,70,229,0.14)" : "1px solid rgba(15,23,42,0.03)",
                          background: expanded ? "linear-gradient(180deg, rgba(255,255,255,1), rgba(249,250,251,1))" : "#fff",
                        }}
                      >
                        <div
                          style={styles.subjectHeader}
                          onClick={() => toggleSubject(idx)}
                          role="button"
                          aria-expanded={expanded}
                          tabIndex={0}
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === "Enter" || e.key === " ") toggleSubject(idx);
                          }}
                        >
                          <div style={leftMarkStyle} />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={styles.subjectTitle}>{item.subjectName}</div>
                            <div style={styles.subjectShort}>{getShortDesc(item)}</div>
                          </div>

                          <div style={styles.rightIconBox}>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>{item.trend ? "Xu hướng" : ""}</div>
                            <div style={{ ...styles.chevron, transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</div>
                          </div>
                        </div>

                        {expanded && (
                          <div style={styles.subjectContent}>
                            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ ...styles.badge, background: "#eef2ff", color: "#3730a3", display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <TrendingUp size={14} />
                                <span style={{ fontWeight: 700 }}>Xu hướng</span>
                              </div>
                              <strong style={{ marginLeft: 6 }}>{item.trend || "Không có"}</strong>
                            </div>

                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                              <div style={{ minWidth: 180 }}>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>Điểm mạnh</div>
                                <div style={{ color: "#475569" }}>{item.strength || "Chưa có"}</div>
                              </div>
                              <div style={{ minWidth: 180 }}>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>Điểm yếu</div>
                                <div style={{ color: "#475569" }}>{item.weakness || "Chưa có"}</div>
                              </div>
                            </div>

                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Gợi ý</div>
                              <div style={{ color: "#475569" }}>{item.suggestion || "Chưa có gợi ý cụ thể."}</div>
                            </div>

                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <button style={{ ...styles.button, padding: "6px 10px", fontSize: 13 }} onClick={() => toast.info(`Mở đề xuất hành động cho ${item.subjectName}`)}>Gợi ý hành động</button>
                              <button style={{ padding: "6px 10px", fontSize: 13, borderRadius: 8, border: "1px solid rgba(15,23,42,0.06)", background: "#fff" }} onClick={() => toast.info(`Sao chép tóm tắt ${item.subjectName}`)}>Sao chép tóm tắt</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p style={{ fontStyle: "italic", color: "#64748b" }}>Không có dữ liệu phân tích môn học.</p>
                )}
              </div>
            </>
          ) : (
            <p>Chưa có phân tích nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningDashboardPage;
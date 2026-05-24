// FILE: src/app/pages/vireya/LearningDashboardPage.tsx
// (Merged & cleaned version — includes suggestionPriority feature, suggestion priority chart moved to its own Card, show ALL subjects)

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Recharts from "recharts";
import { AnimatedCollapse } from "../../../_start/layout/components/AnimatedCollapse";
import { Check, TrendingUp, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
import {
  getLearningDashboardsByUser,
  addLearningDashboard,
  updateLearningDashboard,
} from "../../../services/learningDashboardService";
import { getLearningResultsByUser, getAllLearningResults } from "../../../services/learningResultService";
import { toast, ToastContainer } from "react-toastify";
import { vireyaDashboardService } from "../../../services/vireyaDashboardService";
import { LearningDashboard, SuggestionScale } from "../../../types/LearningDashboard";
import "react-toastify/dist/ReactToastify.css";
import classNames from "classnames";
import { KTSVG } from "../../../_start/helpers";
import { Dropdown1 } from "../../../_start/partials";
import { useFirebaseUser } from "../../hooks/useFirebaseUser";
import { predictScore } from "../../../utils/predictScore";
import { computeRiskLevel } from "../../../utils/riskAnalyzer";
import { doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";
import { computeEffortScore, getEffortLabel } from "../../../utils/effortScore";
import { db } from "../../../firebase/firebase";


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
  for (let i = 0; i < (str || "").length; i++) h = (h << 5) - h + (str || "").charCodeAt(i);
  const hue = Math.abs(h) % 360;
  return `linear-gradient(90deg, hsl(${hue} 85% 55%), hsl(${(hue + 30) % 360} 70% 45%))`;
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

/**
 * safer update/create:
 * - try updateLearningDashboard()
 * - if update fails with "not found" or HTTP 4xx, try addLearningDashboard()
 */
async function safeUpdateOrCreateDashboard(
  id: string | undefined,
  payload: any
) {
  const docId = id || `unique_${Date.now()}`;

  // Nếu chưa có id → CREATE LUÔN
  if (!id) {
    await addLearningDashboard({ id: docId, ...payload } as any);
    return { created: true, updated: false };
  }

  try {
    await updateLearningDashboard(id, payload);
    return { updated: true, created: false };
  } catch (err) {
    // fallback cuối cùng
    await addLearningDashboard({ id: docId, ...payload } as any);
    return { created: true, updated: false };
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

/* ---------- Status Indicator: horizontal bar + percent (animated to exact %) ---------- */
type StatusIndicatorProps = {
  subjectName?: string;
  percent: number; // standardized to 0..100
  color?: string; // can be gradient string
  compact?: boolean;
  showPercent?: boolean;
  minVisiblePercent?: number; // default 0 (use 0 to follow exact %)
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ subjectName = "x", percent, color, compact = false, showPercent = true, minVisiblePercent = 0 }) => {
  // percent is expected to be 0..100
  const pct = Math.round(percent * 10) / 10; // one decimal for display

  // fillPct controls the width of fill. Clamp to 0..100
  const fillPct = Math.max(minVisiblePercent, Math.min(100, percent));

  const barColor = color || colorFromString(subjectName || "x");

  // size
  const barWidthPx = compact ? 100 : 120;
  const barHeightPx = compact ? 8 : 10;

  // animated width state (mount and when avg changes)
  const [animatedWidth, setAnimatedWidth] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
  // animate from 0 -> fillPct with a slight delay so transition triggers
  setAnimatedWidth(0);
  const t = window.setTimeout(() => {
    // use requestAnimationFrame for smoother paint
    rafRef.current = window.requestAnimationFrame(() => setAnimatedWidth(fillPct));
  }, 30);

  return () => {
    clearTimeout(t);
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
    }
  };
}, [fillPct]);

  // alignment adjust
  const justify = showPercent ? "flex-end" : "center";

  return (
    <div
      className="ld-status-cell"
      title={`${pct}%`}
      style={{ justifyContent: justify, display: "flex", alignItems: "center", gap: 10, marginLeft: 12 }}
    >
      <div
        className="ld-status-bar"
        aria-hidden
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(100, Math.max(0, Math.round(pct)))}
        style={{
          width: barWidthPx,
          height: barHeightPx,
          background: "#eef2ff",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          className="ld-status-fill"
          style={{
            width: `${animatedWidth}%`,
            height: "100%",
            transition: "width 700ms cubic-bezier(.2,.9,.2,1)",
            background: barColor,
            borderRadius: 999,
          }}
        />
      </div>

      {showPercent && (
        <div className="ld-status-percent" style={{ width: 48, textAlign: "right", fontWeight: 700, fontSize: 12, color: "#0f172a" }}>
          {pct}%
        </div>
      )}
    </div>
  );
};

/* ---------- Component ---------- */
const LearningDashboardPage: React.FC = () => {
 // 🔥 Hook lấy userId
   const { userId, user } = useFirebaseUser();
  const [dashboards, setDashboards] = useState<LearningDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [selectedDashboard, setSelectedDashboard] = useState<LearningDashboard | null>(null);

  const [learningResults, setLearningResults] = useState<any[]>([]);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<string | null>(null);
// Popup chọn 3 môn chủ chốt
  const [showSelectSubjects, setShowSelectSubjects] = useState(false);
  const [selectedImportantSubjects, setSelectedImportantSubjects] = useState<string[]>([]);

  // CONFIG: choose how suggestion priority should be represented
  // "percent" => 0..100
  // "five" => 1..5 scale
  // Use React state so UI can toggle later if needed
  const [suggestionScale, setSuggestionScale] = useState<SuggestionScale>("percent");

  // Additional UI config requested: sort order, chart type, color palette, and limit (top N)
  const [prioritySort, setPrioritySort] = useState<'desc' | 'asc'>('desc');
  const [priorityChartType, setPriorityChartType] = useState<'vertical' | 'horizontal'>('vertical');
  const [priorityColor, setPriorityColor] = useState<'red' | 'blue' | 'gradient'>('red');
  const [priorityLimit, setPriorityLimit] = useState<number>(0); // 0 => show all

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
     if (!userId) return;
    try {
      const fetchedResults = await getAllLearningResults(userId);
      const final =
  Array.isArray(fetchedResults) && fetchedResults.length > 0
    ? fetchedResults
    : [];

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

  useEffect(() => {
  if (!dashboardToShow) return;

  const subjects =
    dashboardToShow?.importantSubjects?.subjects || {};

  if (Object.keys(subjects).length !== 3) {
    setShowSelectSubjects(true);
  } else {
    setShowSelectSubjects(false);
  }
}, [dashboardToShow]);

 useEffect(() => {
  if (!user) return;

  const ref = doc(db, "userStats", user.uid);
  setDoc(
    ref,
    { dashboardOpens: increment(1) },
    { merge: true }
  );
}, [user]);

  // compute suggestion priority for a subject (0..100 fallback) — prefer explicit field from AI if present
  function computeSuggestionPriorityForSubject(subjectName: string) {
    const rawInsights: any[] = Array.isArray(dashboardToShow?.subjectInsights) ? dashboardToShow.subjectInsights : [];
    const item = rawInsights.find((it: any) => (it?.subjectName || "").toString().toLowerCase() === (subjectName || "").toLowerCase());
    if (item && typeof item.suggestionPriority === "number") {
      // accept either 0..100 or 1..5 (map to 0..100)
      const v = item.suggestionPriority;
      if (v > 5) return Math.max(0, Math.min(100, Math.round(v)));
      // if 1..5 scale from AI, map to 0..100
      const mapped = Math.round(((v - 1) / 4) * 100);
      return Math.max(0, Math.min(100, mapped));
    }

    // fallback heuristic (deterministic):
    // - lower average => higher priority
    // - if AI reported weakness => +30
    // - if recent trend negative => +10
    const avg = currentAverageFromDashboard(subjectName) || 0;
    const p = computeProgressForSubject(subjectName);
    const itemWeak = (rawInsights.find((it:any)=> (it?.subjectName||"").toLowerCase() === (subjectName||"").toLowerCase())?.weakness) ? 1 : 0;

    let score = Math.round(((10 - avg) / 10) * 60 + itemWeak * 30 + (p.delta < 0 ? Math.min(10, Math.round(Math.abs(p.percent) / 10)) : 0));
    if (score < 0) score = 0;
    if (score > 100) score = 100;
    return score;
  }

  const { subjectsData, anyFallback } = useMemo(() => {
    const data: Array<{ subject: string; "Thường xuyên": number; "Giữa kỳ": number; "Cuối kỳ": number; suggestionPriority?: number; predictedScore?: number } > = [];
    if (!dashboardToShow) return { subjectsData: data, anyFallback: false };
    const fb = new Map<string, boolean>();
    const subjectNames = Object.keys(dashboardToShow.importantSubjects?.subjects || {});

    (subjectNames || []).forEach((name) => {
      const { tx, gk, ck, fromInsight } = extractScoresForSubject(dashboardToShow, name);
      const suggestionPriority = computeSuggestionPriorityForSubject(name); // 0..100
const rawPredicted = predictScore(
  Number(tx) || 0,
  Number(gk) || 0,
  Number(ck) || 0
);

const predicted = Number.isFinite(rawPredicted) ? rawPredicted : 0;
      data.push({ subject: name, "Thường xuyên": Number(tx) || 0, "Giữa kỳ": Number(gk) || 0, "Cuối kỳ": Number(ck) || 0, suggestionPriority, predictedScore: predicted });
      fb.set(name, fromInsight);
    });
    return { subjectsData: data, anyFallback: Array.from(fb.values()).some((v) => v) };
}, [dashboardToShow?.id, learningResults]);


  // Build a list of ALL subjects to show in the separate Suggestion Priority card
  const allSubjectsWithPriority = useMemo(() => {
    // compute subjects directly from available sources (avoid using a var declared later)
    const set = new Set<string>();
    // from importantSubjects
    const importantKeys = Object.keys(dashboardToShow?.importantSubjects?.subjects || {});
    importantKeys.forEach((k) => set.add((k || "").toString()));
    // from insights
    if (Array.isArray(dashboardToShow?.subjectInsights)) {
      dashboardToShow!.subjectInsights!.forEach((it: any) => { if (it?.subjectName) set.add((it.subjectName||"").toString()); });
    }
    // from raw learningResults (compute locally to avoid temporal-deadzone error)
    const resultsSubjects = Array.from(new Set((learningResults || []).map((r: any) => r.subjectName).filter(Boolean)));
    resultsSubjects.forEach((s: any) => set.add((s||"").toString()));

    // build array with computed priorities
    let arr = Array.from(set).map((sub) => ({ subject: sub, suggestionPriority: computeSuggestionPriorityForSubject(sub) }));

    // sort according to UI control
    arr.sort((a, b) => {
      if (prioritySort === 'asc') {
        if (a.suggestionPriority !== b.suggestionPriority) return a.suggestionPriority - b.suggestionPriority;
      } else {
        if (a.suggestionPriority !== b.suggestionPriority) return b.suggestionPriority - a.suggestionPriority;
      }
      // tie-breaker: alphabetical
      return String(a.subject).localeCompare(String(b.subject));
    });

    // apply limit if set (>0)
    if (Number.isFinite(priorityLimit) && priorityLimit > 0) {
      arr = arr.slice(0, priorityLimit);
    }

    return arr;
  }, [dashboardToShow, learningResults, prioritySort, priorityLimit]);

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

  // A set for quick lookup (lowercased)
  const subjectsFromResultsSet = useMemo(() => {
    return new Set((subjectsFromResults || []).map((s) => (s || "").toString().toLowerCase()));
  }, [subjectsFromResults]);

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

  // --- Updated: computeProgressForSubject now returns "Bằng nhau" when last === prev ---
  function computeProgressForSubject(subjectName: string) {
    const serie = seriesForSubject(subjectName);
    // nếu có lịch sử
    if (serie && serie.length > 0) {
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

      // Nếu điểm **bằng nhau chính xác** -> ghi "Bằng nhau"
      if (last === prev) {
        trendLabel = "Bằng nhau";
      } else if (delta > 0.05) {
        trendLabel = `Tăng ${Math.abs(percent).toFixed(1)}%`;
      } else if (delta < -0.05) {
        trendLabel = `Giảm ${Math.abs(percent).toFixed(1)}%`;
      }

      return { delta, percent, trendLabel, last, prev };
    }

    // fallback: nếu không có lịch sử, dùng avg từ dashboard (0..10) -> map sang 0..100
    const avg = currentAverageFromDashboard(subjectName) || 0;
    const percentFromAvg = Math.round(avg * 10 * 10) / 10; // 1 decimal, e.g. 3.85 -> 38.5
    return { delta: 0, percent: percentFromAvg, trendLabel: "Không có dữ liệu lịch sử", last: avg, prev: avg };
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
      const docId = (dashboardToShow as any)?.id || `unique_${Date.now()}`;
      const payload: any = {};

      // create nested object instead of dot-path key (avoid Firestore 400)
      payload.subjectProgress = { ...(payload.subjectProgress || {}) };
      payload.subjectProgress[subjectName] = { ...p, updatedAt: new Date() };

      await safeUpdateOrCreateDashboard(docId, payload);
      toast.success(`${subjectName}: Tiến bộ đã được lưu (${Math.abs(p.percent).toFixed(1)}%).`);
    } catch (err) {
      console.error("saveProgressForSubject failed", err);
      toast.error("Không thể lưu tiến bộ.");
      throw err;
    }
  }

const handleSelectSubjectDetail = (subject: string) => {
  setSelectedSubjectDetail(prev =>
    prev === subject ? null : subject
  );
};

const toggleImportantSubject = (subject: string) => {
  setSelectedImportantSubjects((prev) => {
    if (prev.includes(subject)) {
      return prev.filter((s) => s !== subject);
    }
    if (prev.length >= 3) return prev;
    return [...prev, subject];
  });
};
const saveImportantSubjects = async () => {
  if (!dashboardToShow || selectedImportantSubjects.length !== 3) return;

  const subjectsObj: any = {};
  selectedImportantSubjects.forEach((s) => {
    subjectsObj[s] = {};
  });

  try {
    await safeUpdateOrCreateDashboard(dashboardToShow.id, {
      importantSubjects: {
        subjects: subjectsObj,
      },
    });

    toast.success("Đã lưu 3 môn chủ chốt");
    await loadDashboards();
    setShowSelectSubjects(false);
  } catch (err) {
    console.error(err);
    toast.error("Không thể lưu môn chủ chốt");
  }
};

  // Filter subjectInsights to avoid showing AI-only subjects unless they appear in real results or importantSubjects
  const filteredSubjectInsights = useMemo(() => {
    const raw: any[] = Array.isArray(dashboardToShow?.subjectInsights) ? dashboardToShow!.subjectInsights! : [];
    const importantSubjectKeys = Object.keys(dashboardToShow?.importantSubjects?.subjects || {}).map((k) => k.toLowerCase());
    return raw
      .filter((it: any) => {
        const name = (it?.subjectName || "").toString().toLowerCase();
        if (!name) return false;
        // show if present in actual learning results OR if subject is marked important
        return subjectsFromResultsSet.has(name) || importantSubjectKeys.includes(name);
      })
      .map((it: any) => {
        // enrich with suggestionPriority (computed fallback if missing)
        const sp = computeSuggestionPriorityForSubject(it?.subjectName || "");
        return { ...it, suggestionPriority: sp };
      });
  }, [dashboardToShow, subjectsFromResultsSet, learningResults]);

  

  return (
    <div className="ld-container">
      {showSelectSubjects && (
  <div className="ld-popup-overlay">
    <div className="ld-popup">
      <h3 style={{ marginBottom: 12 }}>🎯 Chọn 3 môn chủ chốt</h3>

      <p style={{ fontSize: 14, color: "#64748b" }}>
        Chọn đúng <b>3 môn</b> để hệ thống phân tích chính xác hơn.
      </p>

      <div className="ld-subject-grid">
        {subjectsFromResults.map((s) => (
          <div
            key={s}
            className={classNames("ld-subject-item", {
              selected: selectedImportantSubjects.includes(s),
            })}
            onClick={() => toggleImportantSubject(s)}
          >
            {s}
          </div>
        ))}
      </div>

      <button
        className="ld-save-btn"
        disabled={selectedImportantSubjects.length !== 3}
        onClick={saveImportantSubjects}
      >
        Lưu 3 môn đã chọn
      </button>
    </div>
  </div>
)}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ld-grid">
        {/* LEFT */}
        <div className="ld-left">
          <div className="ld-left-top">
            <h2 className="ld-title">🧭 La bàn định hướng học tập</h2>
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

          {/* Fixed misuse of classNames (was `className={`card ${classNames}`) */}
          <div className="card">
            {/* begin::Header */}
            <div className="card-header align-items-center border-0 mt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="fw-bolder text-dark fs-3">Quá trình học tập</span>
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

                {dashboards.map((dashboard, idx) => {
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

                  // ensure unique key even if dashboard.id duplicates: use id + idx
                  const key = `${dashboard?.id ?? "dash"}-${idx}`;

                  return (
                    <div
                      className="timeline-item"
                      key={key}
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
               {/* 🎯 CÁC MÔN CHỦ CHỐT */}
                <div className="ld-section-title">🎯 Các môn chủ chốt</div>

                {!dashboardToShow?.importantSubjects?.subjects ||
                Object.keys(dashboardToShow.importantSubjects.subjects).length !== 3 ? (
                  // ❗ CHƯA CHỌN 3 MÔN
                  <p className="ld-empty italic">
                    Bạn chưa chọn <b>3 môn chủ chốt</b>. Hãy lựa chọn để hệ thống phân tích chính xác hơn.
                  </p>
                ) : subjectsData.length === 0 ? (
                  // ❗ ĐÃ CHỌN 3 MÔN NHƯNG CHƯA CÓ DỮ LIỆU
                  <p className="ld-empty italic">
                    Chưa có điểm số cho 3 môn chủ chốt. Vui lòng cập nhật kết quả học tập.
                  </p>
                ) : (
                  // ✅ ĐÃ CHỌN & CÓ DỮ LIỆU → HIỂN THỊ PHÂN TÍCH
                  <div className="ld-infobox">
                    {/* --- Biểu đồ --- */}
                    <div className="ld-chart-wrap">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={subjectsData}
                          margin={{ top: 18, right: 20, left: 0, bottom: 6 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Legend verticalAlign="top" />

                          <Bar dataKey="Thường xuyên" fill="#4f46e5" animationDuration={800} />
                          <Bar dataKey="Giữa kỳ" fill="#22c55e" animationDuration={800} />
                          <Bar dataKey="Cuối kỳ" fill="#f59e0b" animationDuration={800} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* --- Fallback note nếu dữ liệu thiếu --- */}
                    {anyFallback && (
                      <div className="ld-fallback-note">
                        Một số môn thiếu dữ liệu chi tiết. Biểu đồ đang hiển thị điểm mặc định hoặc dữ liệu tổng hợp.
                      </div>
                    )}

                    {/* --- 3 nội dung phân tích chính --- */}
                    <div className="ld-rows3">
                      <div className="ld-col">
                        <div className="ld-col-title"></div>
                        <div className="ld-col-text">
                           <b>Điểm mạnh: </b>
                          {dashboardToShow.importantSubjects?.overallStrengths || "Chưa có dữ liệu"}
                        </div>
                      </div>

                      <div className="ld-col">
                        <div className="ld-col-title"></div>
                        <div className="ld-col-text">
                          <b>Điểm yếu: </b>
                          {dashboardToShow.importantSubjects?.overallWeaknesses || "Chưa có dữ liệu"}
                        </div>
                      </div>

                      <div className="ld-col">
                        <div className="ld-col-title"></div>
                        <div className="ld-col-text">
                          <b>Chiến lược: </b>
                          {dashboardToShow.importantSubjects?.learningAdvice || "Chưa có dữ liệu"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            
              {/* NEW: Separate card for Suggestion Priority showing ALL subjects */}
              <div className="ld-card">
                <div className="ld-section-title">📈 Ưu tiên cải thiện (tất cả môn)</div>

                {/* Controls: sort, chart type, color, limit */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>Sắp xếp</div>
                    <select value={prioritySort} onChange={(e) => setPrioritySort(e.target.value as any)} style={{ padding: 6, borderRadius: 8 }}>
                      <option value="desc">Ưu tiên cao → thấp</option>
                      <option value="asc">Ưu tiên thấp → cao</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>Kiểu biểu đồ</div>
                    <select value={priorityChartType} onChange={(e) => setPriorityChartType(e.target.value as any)} style={{ padding: 6, borderRadius: 8 }}>
                      <option value="vertical">Cột đứng (vertical)</option>
                      <option value="horizontal">Cột ngang (horizontal)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>Màu</div>
                    <select value={priorityColor} onChange={(e) => setPriorityColor(e.target.value as any)} style={{ padding: 6, borderRadius: 8 }}>
                      <option value="red">Đỏ</option>
                      <option value="blue">Xanh</option>
                      <option value="gradient">Gradient (đỏ)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>Giới hạn</div>
                    <input type="number" min={0} value={priorityLimit} onChange={(e) => setPriorityLimit(Number(e.target.value || 0))} style={{ width: 80, padding: 6, borderRadius: 8 }} />
                    <div style={{ color: '#64748b', fontSize: 13 }}>0 = tất cả</div>
                  </div>
                </div>

                {allSubjectsWithPriority && allSubjectsWithPriority.length > 0 ? (
                  <div style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height={320}>
                      {priorityChartType === 'vertical' ? (
                        <BarChart data={allSubjectsWithPriority} margin={{ top: 18, right: 20, left: 0, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" tick={{ fontSize: 12 }} interval={0} angle={-35} textAnchor="end" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: any) => `${value}%`} />
                          <Legend />
                          <Bar dataKey="suggestionPriority" fill={priorityColor === 'red' ? '#ef4444' : priorityColor === 'blue' ? '#2563eb' : '#fb7185'} name="Ưu tiên (%)" isAnimationActive={true} animationDuration={900} animationEasing="ease-out" />
                        </BarChart>
                      ) : (
                        // horizontal layout: subject on Y axis, numeric on X
                        <BarChart layout="vertical" data={allSubjectsWithPriority} margin={{ top: 18, right: 20, left: 80, bottom: 6 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                          <YAxis dataKey="subject" type="category" width={140} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: any) => `${value}%`} />
                          <Legend />
                          <Bar dataKey="suggestionPriority" fill={priorityColor === 'red' ? '#ef4444' : priorityColor === 'blue' ? '#2563eb' : '#fb7185'} name="Ưu tiên (%)" isAnimationActive={true} animationDuration={900} animationEasing="ease-out" />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="ld-empty">Không có môn để hiển thị ưu tiên cải thiện.</div>
                )}
              </div>

              <div className="ld-card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>🔎 Kết quả học tập (Chọn để xem chi tiết)

            </div>
           {subjectsFromResults.length === 0 ? (
            <div className="ld-empty">Chưa có kết quả học tập.</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {subjectsFromResults.map((s, idx) => (
                <li key={`${String(s)}-${idx}`} style={{ marginBottom: 8 }}>
                  <button
                    aria-label={`Mở chi tiết môn ${s}`}
                    className="subject-button-compact"
                    onClick={() => handleSelectSubjectDetail(s)}
                    type="button"
                  >
                    {/* LEFT: name + percent + status */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 140 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ fontWeight: 700 }}>{s}</div>

                          {(() => {
                            const p = computeProgressForSubject(s);
                            const spRaw = computeSuggestionPriorityForSubject(s);
                            const spDisplay =
                              suggestionScale === "five"
                                ? Math.max(1, Math.round((spRaw / 100) * 4) + 1)
                                : spRaw;
                            return (
                              <div style={{ marginLeft: 8, fontSize: 12, color: "#7c2d12", fontWeight: 800 }}>
                                Ưu tiên: {spDisplay}
                                {suggestionScale === "percent" ? "%" : ""}
                              </div>
                            );
                          })()}
                        </div>

                        {/* compact bar */}
                        <div style={{ marginTop: 8 }}>
                          <StatusIndicator
                            subjectName={String(s)}
                            percent={Math.min(100, Math.max(0, currentAverageFromDashboard(s) * 10))}
                            showPercent={true}
                            compact={true}
                            minVisiblePercent={3}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginLeft: "auto" }}>
                      {selectedSubjectDetail === s ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </button>

                  {/* COLLAPSE */}
                  <AnimatedCollapse show={selectedSubjectDetail === s}>
                    <div
                      style={{
                        padding: 12,
                        background: "#fff",
                        borderRadius: 8,
                        marginTop: 8,
                        border: "1px solid rgba(15,23,42,0.04)"
                      }}
                    >
                      {(() => {
                        const insightItem = (dashboardToShow?.subjectInsights || []).find(
                          (it: any) =>
                            (it?.subjectName || "").toLowerCase() === (s || "").toLowerCase()
                        );

                        if (insightItem) {
                          const spRaw = computeSuggestionPriorityForSubject(s);
                          const spDisplay =
                            suggestionScale === "five"
                              ? Math.max(1, Math.round((spRaw / 100) * 4) + 1)
                              : spRaw;

                          const { tx, gk, ck } = extractScoresForSubject(dashboardToShow, s);
                          const currentSubjectData = subjectsData.find(data => data.subject === s);

                          // Dự đoán điểm lấy từ Firestore
                          const predicted = currentSubjectData?.predictedScore ?? 0;

                          // Effort = điểm trung bình môn * 10 (giới hạn 0–100)
                          const effort = Math.min(100, Math.max(0, currentAverageFromDashboard(s) * 10));

                          // Phân loại effort
                          let effortLabel = getEffortLabel(effort);

                          // (Tùy chọn) Gợi ý nâng cấp nhãn theo dự đoán
                          if (predicted < ck) {
                            effortLabel = "Cần cải thiện";
                          } else if (predicted > ck) {
                            effortLabel = "Có tiến bộ";
                          }


                          return (
                            <div>
                              {/* Xu hướng */}
                              <p style={{ margin: "6px 0" }}>
                                <TrendingUp size={14} />{" "}
                                <strong>{insightItem.trend || "Không có xu hướng"}</strong>
                              </p>

                              {/* Điểm mạnh / yếu */}
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                                <div style={{ minWidth: 150 }}>
                                  <div style={{ fontWeight: 700 }}>Điểm mạnh</div>
                                  <div style={{ color: "#475569" }}>
                                    {insightItem.strength || "Chưa có"}
                                  </div>
                                </div>
                                <div style={{ minWidth: 150 }}>
                                  <div style={{ fontWeight: 700 }}>Điểm yếu</div>
                                  <div style={{ color: "#475569" }}>
                                    {insightItem.weakness || "Chưa có"}
                                  </div>
                                </div>
                              </div>

                              {/* Gợi ý */}
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontWeight: 700 }}>Gợi ý</div>
                                <div style={{ color: "#475569" }}>
                                  {insightItem.suggestion || "Chưa có gợi ý cụ thể."}
                                </div>
                              </div>

                              {/* Ưu tiên cải thiện */}
                              <div
                                style={{
                                  marginTop: 6,
                                  display: "flex",
                                  gap: 12,
                                  alignItems: "center"
                                }}
                              >
                                <div style={{ fontWeight: 800 }}>Ưu tiên cải thiện</div>
                                <div style={{ minWidth: 160 }}>
                                  <div
                                    style={{
                                      background: "#f8fafc",
                                      padding: 8,
                                      borderRadius: 8
                                    }}
                                  >
                                    <div style={{ fontWeight: 900 }}>
                                      {spDisplay}
                                      {suggestionScale === "percent" ? "%" : ""}
                                    </div>
                                    <div
                                      style={{
                                        height: 8,
                                        borderRadius: 8,
                                        background: "#eef2ff",
                                        marginTop: 6,
                                        overflow: "hidden"
                                      }}
                                    >
                                      <div
                                        className="ld-suggestion-fill"
                                        style={{
                                          width: `${spRaw}%`,
                                          height: "100%",
                                          background: "linear-gradient(90deg,#fb7185,#f97316)"
                                        }}
                                      />
                                    </div>
                                  </div>
                                   {effort !== null && (
                                  <div className="ld-card" style={{ marginTop: 20 }}>
                                    <div className="ld-section-title">🔥 Chỉ số nỗ lực học tập</div>

                                    <div style={{ fontSize: 32, fontWeight: 700 }}>
                                      {effort}/100
                                    </div>

                                    <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
                                      {effortLabel}
                                    </div>

                                    <div style={{ marginTop: 10, height: 10, background: "#e5e7eb", borderRadius: 6 }}>
                                      <div
                                        style={{
                                          width: `${effort}%`,
                                          height: "100%",
                                          background: "linear-gradient(90deg,#4ade80,#22c55e)",
                                          borderRadius: 6,
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div style={{ fontStyle: "italic", color: "#64748b" }}>
                            Chưa có phân tích AI cho môn này — đang hiển thị điểm gốc nếu có.
                          </div>
                        );
                      })()}
                    </div>
                  </AnimatedCollapse>

                  {/* CHI TIẾT ĐIỂM */}
                  <div style={{ marginTop: 12 }} className="ld-subject-detail">
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap"
                      }}
                    >
                      {/* Bảng điểm */}
                      <div style={{ minWidth: 220 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Chi tiết điểm</div>
                        {(() => {
                          const scores = extractScoresForSubject(dashboardToShow, s);
                          const avg = currentAverageFromDashboard(s);

                          return (
                            <div>
                              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                <div style={{ minWidth: 82 }}>
                                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Thường xuyên</div>
                                  <div style={{ fontWeight: 700 }}>{scores.tx ?? 0}</div>
                                </div>
                                <div style={{ minWidth: 82 }}>
                                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Giữa kỳ</div>
                                  <div style={{ fontWeight: 700 }}>{scores.gk ?? 0}</div>
                                </div>
                                <div style={{ minWidth: 82 }}>
                                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Cuối kỳ</div>
                                  <div style={{ fontWeight: 700 }}>{scores.ck ?? 0}</div>
                                </div>
                              </div>

                              <div style={{ marginTop: 6 }}>
                                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                                  Điểm trung bình (TX20/GK30/CK50)
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                                  <div
                                    style={{
                                      flex: 1,
                                      background: "#eef2ff",
                                      height: 12,
                                      borderRadius: 8,
                                      overflow: "hidden"
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${Math.min(100, (avg / 10) * 100)}%`,
                                        height: "100%",
                                        background: "linear-gradient(90deg,#60a5fa,#06b6d4)"
                                      }}
                                    />
                                  </div>
                                  <div style={{ minWidth: 48, textAlign: "right", fontWeight: 700 }}>
                                    {avg}/10
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Biểu đồ mini */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ marginTop: 8 }}>
                          {(seriesForSubject(s) || []).length > 0 ? (
                            <div style={{ height: 90 }}>
                              <ResponsiveContainer width="100%" height={90}>
                                <LineChart data={seriesForSubject(s)}>
                                  <XAxis dataKey="semester" hide />
                                  <YAxis domain={[0, 10]} hide />
                                  <Tooltip />
                                  <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div style={{ fontSize: 13, color: "#64748b" }}>
                              Không có dữ liệu điểm lịch sử.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Biểu đồ lớn */}
                  {(seriesForSubject(s) || []).length > 0 ? (
                    <div style={{ marginTop: 8 }}>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={seriesForSubject(s)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="semester" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                      Không có dữ liệu điểm để vẽ biểu đồ.
                    </div>
                  )}
                  {/* 🔮 Dự đoán điểm kỳ tới */}
                  

                </li>
              ))}
            </ul>
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

/* Compact subject button (left list) */
.subject-button-compact { width: 100%; text-align: left; padding: 10px 12px; background: #f8fafc; border: none; outline: none; cursor: pointer; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; overflow: visible; }

/* Infobox + chart */
.ld-infobox { background: #f8fafc; padding: 16px; border-radius: 10px; margin-bottom: 12px; box-shadow: inset 0 0 10px rgba(99,102,241,0.03); color: #0f172a; }

/* Status cell (horizontal) */
.ld-status-cell { display: flex; align-items: center; gap: 10px; margin-left: 12px; min-width: 170px; justify-content: flex-end; }
.ld-status-bar { width: 120px; height: 8px; background: #eef2ff; border-radius: 999px; overflow: hidden; }
.ld-status-fill { height: 100%; border-radius: 999px; transition: width .45s ease; }
.ld-status-percent { width: 48px; text-align: right; font-weight: 700; font-size: 12px; color: #0f172a; }

/* suggestion fill */
.ld-suggestion-fill { height: 100%; border-radius: 8px; transition: width 700ms cubic-bezier(.2,.9,.2,1); }

/* responsive tweaks */
@media (max-width: 900px) {
  .ld-grid { flex-direction: column; }
  .ld-status-cell { min-width: 120px; }
}
  .ld-popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5000;
}

.ld-popup {
  background: white;
  padding: 28px;
  border-radius: 14px;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  animation: fadeIn 0.25s ease;
}

.ld-subject-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
}

.ld-subject-item {
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #f8fafc;
  cursor: pointer;
  transition: 0.25s;
  font-weight: 600;
}

.ld-subject-item.selected {
  background: #2563eb;
  color: white;
  border-color: #1d4ed8;
}

.ld-save-btn {
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  background: #10b981;
  color: white;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  opacity: 1;
  transition: 0.25s;
}

.ld-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

      `}</style>
</div>
);
};

export default LearningDashboardPage;

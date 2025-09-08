// src/app/pages/neovana/PhanTichNangLucPage.tsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";

/**
 * PhanTichNangLucPage - full file
 * - Nodes spread out more (stronger repulsion + larger collision padding)
 * - Nodes clamped inside bounds (no overflow)
 * - Sparkline safe
 * - Inline CSS included
 */

/* ---------------- Types ---------------- */
interface Course {
  title: string;
  weeks: number;
  matching?: number;
}

interface Skill {
  id: string;
  name: string;
  score: number; // 0-100
  confidence: number; // 0-1
  sources?: string[];
  history?: number[]; // array of past scores
  courses?: Course[];
  radius?: number;
  x?: number;
  y?: number;
}

interface Goal {
  id: string;
  title: string;
  relatedSkills: string[]; // skill ids or names
}

interface AiAnalysis {
  summary: string;
  weeks: number;
  needed: number;
}

/* ------------- Helpers -------------- */
function generateNodesFromSkills(skills: Skill[], width: number, height: number): Skill[] {
  const maxScore = 100;
  return skills.map((s) => ({
    ...s,
    radius: 28 + (s.score / maxScore) * 40,
    x: Math.random() * width,
    y: Math.random() * height,
  }));
}

function aiGapAnalysisLocal(skill: Skill, goal: Goal | null): AiAnalysis {
  const wants = (goal?.relatedSkills || []).includes(skill.name) || (goal?.relatedSkills || []).includes(skill.id);
  const needed = wants ? Math.max(0, 70 - skill.score) : Math.max(0, 60 - skill.score);
  return {
    summary: wants
      ? `Để đạt mục tiêu, cần tăng ${skill.name} thêm ${needed} điểm (khoảng ${Math.ceil(needed / 5)} tuần với tiến độ 3 buổi/tuần).`
      : `Kỹ năng ${skill.name} không nằm trong nhóm mục tiêu chính nhưng có thể cải thiện thêm ${needed} điểm.`,
    weeks: Math.ceil(needed / 5),
    needed,
  };
}

/* ------------- Sparkline ------------- */
const Sparkline: React.FC<{ values?: number[] }> = ({ values = [] }) => {
  const w = 120;
  const h = 28;
  if (!values || values.length === 0) return <svg width={w} height={h} />;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const len = values.length;

  // handle single value or all-equal case safely
  const points = values.map((v, i) => {
    let x: number;
    if (len === 1) {
      x = w / 2;
    } else {
      x = (i / (len - 1)) * w;
    }
    const denom = (max - min) || 1;
    const y = h - ((v - min) / denom) * h;
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h}>
      <polyline fill="none" stroke="#374151" strokeWidth={1.6} points={points.join(" ")} />
    </svg>
  );
};

/* ------------- SkillsGraph (spread-out tuning) ------------- */
const SkillsGraph: React.FC<{
  skills: Skill[];
  selected: Skill | null;
  onSelect: (s: Skill) => void;
  width?: number;
  height?: number;
}> = ({ skills, selected, onSelect, width = 900, height = 560 }) => {
  const [nodes, setNodes] = useState<Skill[]>(() => generateNodesFromSkills(skills, width, height));
  const simRef = useRef<d3.Simulation<any, undefined> | null>(null);

  useEffect(() => {
    // build sim nodes with safe defaults
    const simNodes = skills.map((s) => ({
      ...s,
      radius: s.radius ?? (28 + (s.score / 100) * 40),
      x: s.x ?? Math.random() * width,
      y: s.y ?? Math.random() * height,
    })) as any[];

    setNodes(simNodes.map((n) => ({ ...n })));

    // TUNING: make nodes spread out more
    // - chargeStrength: negative -> repulsion; increased magnitude = more spread
    // - collisionPadding: add extra padding so circles don't cluster
    // - forceX/forceY: mild, so nodes are not pulled too strongly to center
    // - velocityDecay decreased a bit to allow more movement smoothing
    const chargeStrength = -220; // was -80, now larger magnitude to push nodes apart
    const collisionPadding = 18; // was ~6, increase to create more spacing
    const forceXYStrength = 0.01; // mild pull to center (small)
    const alphaDecay = 0.03;
    const velocityDecay = 0.15;

    const sim = d3
      .forceSimulation(simNodes)
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX().x(width / 2).strength(forceXYStrength))
      .force("y", d3.forceY().y(height / 2).strength(forceXYStrength))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("collision", d3.forceCollide().radius((d: any) => (d.radius ?? 30) + collisionPadding))
      .alphaDecay(alphaDecay)
      .velocityDecay(velocityDecay)
      .on("tick", () => {
        // clamp each node to remain inside the visible rect considering its radius
        for (const n of simNodes) {
          const r = typeof n.radius === "number" && Number.isFinite(n.radius) ? n.radius : 30;
          // ensure x/y are numbers
          n.x = typeof n.x === "number" && Number.isFinite(n.x) ? n.x : width / 2;
          n.y = typeof n.y === "number" && Number.isFinite(n.y) ? n.y : height / 2;

          // clamp
          n.x = Math.max(r, Math.min(width - r, n.x));
          n.y = Math.max(r, Math.min(height - r, n.y));
        }

        // trigger react re-render with shallow copy
        setNodes(simNodes.map((n) => ({ ...n })));
      });

    // kick the simulation a bit so nodes spread quickly
    sim.alpha(0.9).restart();

    simRef.current = sim;

    return () => {
      if (simRef.current) {
        simRef.current.stop();
        simRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills, width, height]);

  return (
    // keep container clipped to avoid circles overflowing card
    <div className="border rounded-lg bg-white shadow-sm p-3" style={{ overflow: "hidden" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="bounds">
            <rect x={0} y={0} width={width} height={height} rx={12} ry={12} />
          </clipPath>

          <linearGradient id="grad" x1="0" x2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="gradSel" x1="0" x2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Apply clipPath to group containing nodes */}
        <g clipPath="url(#bounds)">
          {nodes.map((n) => {
            const rx = typeof n.x === "number" && Number.isFinite(n.x) ? n.x : width / 2;
            const ry = typeof n.y === "number" && Number.isFinite(n.y) ? n.y : height / 2;
            const r = typeof n.radius === "number" && Number.isFinite(n.radius) ? n.radius : 30;

            return (
              <g
                key={n.id}
                transform={`translate(${rx}, ${ry})`}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(n)}
              >
                <circle
                  r={r}
                  fill={selected?.id === n.id ? "url(#gradSel)" : "url(#grad)"}
                  stroke="#0f172a"
                  strokeWidth={1}
                  opacity={0.98}
                />
                <text
                  textAnchor="middle"
                  y={4}
                  style={{ fontSize: 12, fontWeight: 700, pointerEvents: "none", fill: "#fff" }}
                >
                  {n.name}
                </text>

                {/* score badge */}
                <g transform={`translate(${r - 12}, ${-r + 10})`}>
                  <rect x={-6} y={-6} width={36} height={20} rx={8} fill="#ffffffcc" />
                  <text x={12} y={9} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: "#0b1220" }}>
                    {n.score}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

/* ------------- ControlPanel ------------- */
const ControlPanel: React.FC<{
  selected: Skill | null;
  aiAnalysis: AiAnalysis | null;
  onAnalyze: (s: Skill) => Promise<void>;
  onAddCourse: (c: Course) => void;
  goal: Goal | null;
}> = ({ selected, aiAnalysis, onAnalyze, onAddCourse, goal }) => {
  return (
    <div className="w-80 flex-shrink-0">
      <div className="space-y-4">
        <div className="p-3 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Mục tiêu: <span className="text-indigo-600">{goal?.title ?? "Chưa đặt"}</span></h4>
              <p className="text-xs text-gray-500">Ưu tiên: {goal?.relatedSkills.length ?? 0} kỹ năng</p>
            </div>
            <button className="btn btn-xs btn-ghost">Chỉnh sửa</button>
          </div>

          <div className="mt-3">
            <div className="text-sm text-gray-600">Thanh tiến độ đến mục tiêu hiện tại</div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
              <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: "42%" }} />
            </div>
            <div className="mt-2 text-xs text-gray-500">42% đến {goal?.title ?? "..."}</div>
          </div>
        </div>

        <div className="p-3 bg-white rounded-lg shadow">
          <h5 className="font-medium mb-2">Chi tiết kỹ năng</h5>

          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{selected.name}</div>
                  <div className="text-xs text-gray-500">Score: <span className="font-medium">{selected.score}/100</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Nguồn</div>
                  <div className="text-sm">{selected.sources?.slice(0, 2).join(", ") || "N/A"}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-2 rounded text-xs">
                <strong>Trend:</strong>
                <div className="mt-2"><Sparkline values={selected.history ?? []} /></div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => onAnalyze(selected)} className="flex-1 btn btn-sm bg-indigo-600 text-white">Phân tích khoảng cách</button>
                <button onClick={() => { /* local quick */ alert("Đã thực hiện phân tích nhanh (local)") }} className="flex-1 btn btn-sm btn-outline">Nhanh</button>
              </div>

              {aiAnalysis && (
                <div className="p-2 bg-white border rounded text-sm">
                  <div className="font-medium text-sm">Đề xuất AI</div>
                  <div className="text-gray-600 text-sm mt-1">{aiAnalysis.summary}</div>
                  <div className="mt-2 flex gap-2">
                    <button className="btn btn-xs btn-primary" onClick={() => alert("Chấp nhận lộ trình nhanh (mock)")}>Ưu tiên 4 tuần</button>
                    <button className="btn btn-xs" onClick={() => alert("Xem lộ trình 12 tuần (mock)")}>Xem lộ trình 12 tuần</button>
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-gray-500">Gợi ý khoá học</div>
                <div className="mt-2 space-y-2">
                  {selected.courses?.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div>
                        <div className="text-sm font-medium">{c.title}</div>
                        <div className="text-xs text-gray-500">Matching: {c.matching ?? 0}% • {c.weeks} tuần</div>
                      </div>
                      <div>
                        <button onClick={() => onAddCourse(c)} className="btn btn-xs btn-outline">Thêm</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Chưa có kỹ năng được chọn. Click một đảo (bên trái) để xem chi tiết.</div>
          )}
        </div>

        <div className="p-3 bg-white rounded-lg shadow text-sm">
          <div className="font-medium mb-2">Đề xuất ưu tiên</div>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Khoá “Phân tích dữ liệu cơ bản” — Matching 87% (4 tuần)</li>
            <li>Lộ trình viết học thuật — Matching 73% (8 tuần)</li>
            <li>IELTS Listening Booster — Matching 80% (8 tuần)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

/* ------------- Main Page ------------- */
const PhanTichNangLucPage: React.FC = () => {
  // dummy data (replace with real)
  const dummySkills: Skill[] = [
    { id: "analysis", name: "Phân tích", score: 42, confidence: 0.72, history: [30, 35, 40, 42], courses: [{ title: "Phân tích dữ liệu cơ bản", weeks: 4, matching: 87 }] },
    { id: "writing", name: "Viết học thuật", score: 45, confidence: 0.65, history: [50, 48, 46, 45], courses: [{ title: "Luyện viết học thuật", weeks: 8, matching: 73 }] },
    { id: "listening", name: "Lắng nghe", score: 40, confidence: 0.6, history: [35, 38, 39, 40], courses: [{ title: "IELTS Listening Booster", weeks: 8, matching: 80 }] },
    { id: "projects", name: "Làm dự án", score: 78, confidence: 0.9, history: [65, 70, 75, 78], courses: [{ title: "Quản lý dự án nhỏ", weeks: 6, matching: 60 }] },
    { id: "communication", name: "Giao tiếp", score: 70, confidence: 0.85, history: [60, 66, 68, 70], courses: [{ title: "Thuyết trình hiệu quả", weeks: 4, matching: 70 }] },
    { id: "selflearning", name: "Tự học", score: 66, confidence: 0.8, history: [50, 55, 60, 66], courses: [{ title: "Kỹ năng học chủ động", weeks: 4, matching: 75 }] },
    { id: "logic", name: "Toán tư duy", score: 60, confidence: 0.7, history: [55, 58, 59, 60], courses: [{ title: "Toán tư duy cơ bản", weeks: 6, matching: 65 }] },
  ];

  const dummyGoal: Goal = { id: "g1", title: "IELTS 6.5", relatedSkills: ["listening", "writing", "reading", "speaking"] };

  const [skills] = useState<Skill[]>(() => generateNodesFromSkills(dummySkills, 900, 560));
  const [selected, setSelected] = useState<Skill | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);

  // analyze (local + optional server call)
  async function analyzeGap(skill: Skill) {
    const local = aiGapAnalysisLocal(skill, dummyGoal);
    setAiAnalysis(local);

    // optional: call your server route for richer AI explanation
    try {
      const res = await fetch("/api/gemini-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: skill.id, skillName: skill.name, currentScore: skill.score, goal: dummyGoal }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data as AiAnalysis);
      }
    } catch (err) {
      // ignore network errors; local analysis remains
      console.warn("AI analyze failed:", err);
    }
  }

  function handleAddCourse(course: Course) {
    // mock: add to schedule / lộ trình — bạn có thể dispatch action hoặc call API ở đây
    alert(`Đã thêm khoá "${course.title}" vào lộ trình (ước tính ${course.weeks} tuần)`);
  }

  const overall = Math.round((dummySkills.reduce((s, k) => s + k.score, 0) / dummySkills.length) * 10) / 10;

  /* Inline CSS (basic styles used by the component) */
  const pageStyles = `
    /* basic reset for our small component */
    .border { border: 1px solid #e6e6e6; }
    .rounded-lg { border-radius: 12px; }
    .rounded { border-radius: 8px; }
    .shadow-sm { box-shadow: 0 1px 4px rgba(12,14,20,0.06); }
    .p-3 { padding: 12px; }
    .p-2 { padding: 8px; }
    .p-4 { padding: 16px; }
    .mb-3 { margin-bottom: 12px; }
    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 12px; }
    .text-sm { font-size: 13px; }
    .text-xs { font-size: 12px; }
    .font-medium { font-weight: 600; }
    .font-semibold { font-weight: 700; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-400 { color: #9ca3af; }
    .bg-white { background: #ffffff; }
    .bg-gray-50 { background: #f9fafb; }
    .bg-gray-100 { background: #f3f4f6; }
    .w-full { width: 100%; }
    .w-80 { width: 320px; }
    .flex { display: flex; }
    .flex-1 { flex: 1; }
    .flex-shrink-0 { flex-shrink: 0; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: 8px; }
    .gap-3 { gap: 12px; }
    .space-y-4 > * + * { margin-top: 12px; }
    .list-decimal { list-style-type: decimal; padding-left: 1rem; }

    /* button */
    .btn { display: inline-flex; align-items:center; justify-content:center; border-radius: 8px; padding: 6px 10px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; }
    .btn:active { transform: translateY(1px); }
    .btn-xs { padding: 4px 8px; font-size: 12px; }
    .btn-sm { padding: 6px 10px; font-size: 13px; }
    .btn-ghost { background: transparent; border: 1px dashed #d1d5db; }
    .btn-outline { background: transparent; border: 1px solid #cbd5e1; }
    .btn-primary { background: #2563eb; color: white; border: none; }
    .bg-gradient-to-r { background: linear-gradient(90deg, #f59e0b, #f43f5e); }

    /* small helpers */
    .text-indigo-600 { color: #4f46e5; }
    .from-emerald-400 { background: linear-gradient(90deg,#34d399,#0ea5a6); }
    .to-sky-500 { /* handled by inline since we used gradient above */ }
    .min-h-\\[520px\\] { min-height: 520px; } /* used in JSX style attr but keep for completeness */
  `;

  return (
    <div className="flex gap-6 p-4 h-[90vh] min-h-[520px]">
      {/* inject styles */}
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      {/* Left: Graph (70%) */}
      <div className="flex-1" style={{ width: "70%" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-2xl font-semibold">Phân tích năng lực — Gương soi năng lực hiện tại</h3>
            <p className="text-sm text-gray-500">Tổng điểm: <span className="font-medium">{overall}/100</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-56 bg-gray-100 rounded-full h-3 overflow-hidden" style={{ width: 224 }}>
              <div className="h-3 rounded-full" style={{ width: `${Math.min(100, overall)}%`, background: "linear-gradient(90deg,#10b981,#0ea5e9)" }} />
            </div>
          </div>
        </div>

        <SkillsGraph skills={skills} selected={selected} onSelect={(s) => { setSelected(s); setAiAnalysis(null); }} />
      </div>

      {/* Right: Panel (30%) */}
      <ControlPanel selected={selected} aiAnalysis={aiAnalysis} onAnalyze={async (s) => await analyzeGap(s)} onAddCourse={handleAddCourse} goal={dummyGoal} />
    </div>
  );
};

export default PhanTichNangLucPage;

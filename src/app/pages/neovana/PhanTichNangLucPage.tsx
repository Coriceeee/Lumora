// src/pages/neovana/PhanTichNangLucPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { motion } from "framer-motion";
import { Play, Activity } from "lucide-react";

import { getLearningResultsByUser, getGeminiAnalysis } from "../../../services/learningResultService";

// -------------------- Types --------------------
type CompScore = { comp_id: string; comp_name: string; score: number };
type TimelinePoint = { date: string; comp_id: string; comp_name: string; score: number };
type CareerRec = { career_id: string; career_name: string; similarity: number; missing_gaps?: { comp_id: string; gap: number }[]; reason?: string };
type SkillEntry = { id: string; name: string; current: number; target?: number };
type CertificateEntry = { name: string; impact: number };

type PageProps = {
  radarData?: CompScore[];
  timelineData?: TimelinePoint[];
  careerRecs?: CareerRec[];
  gptNotes?: string;
  skills?: SkillEntry[];
  certificates?: CertificateEntry[];
  suggestedCertificates?: string[];
};

// -------------------- Helpers --------------------
function normalizeScore(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n <= 10) return Math.round(Math.max(0, Math.min(10, n)) * 10);
  return Math.round(Math.max(0, Math.min(100, n)));
}

const CAREER_AXES = [
  "Communication",
  "Critical Thinking",
  "Problem Solving",
  "Technical Skill",
  "Creativity",
  "Leadership",
];

function mapToCareerAxes(radar: CompScore[]) {
  const accum: Record<string, { sum: number; count: number }> = {};
  CAREER_AXES.forEach((a) => (accum[a] = { sum: 0, count: 0 }));

  const keywordMap: Record<string, string> = {
    comm: "Communication",
    speak: "Communication",
    present: "Communication",
    write: "Communication",
    crit: "Critical Thinking",
    logic: "Critical Thinking",
    analyze: "Critical Thinking",
    problem: "Problem Solving",
    solve: "Problem Solving",
    debug: "Problem Solving",
    code: "Technical Skill",
    program: "Technical Skill",
    data: "Technical Skill",
    tech: "Technical Skill",
    digital: "Technical Skill",
    design: "Creativity",
    creative: "Creativity",
    ux: "Creativity",
    lead: "Leadership",
    manage: "Leadership",
    team: "Leadership",
    project: "Leadership",
  };

  radar.forEach((r) => {
    const key = (r.comp_name || r.comp_id || "").toLowerCase();
    let matched = false;
    Object.keys(keywordMap).forEach((k) => {
      if (key.includes(k)) {
        const axis = keywordMap[k];
        accum[axis].sum += r.score || 0;
        accum[axis].count += 1;
        matched = true;
      }
    });
    if (!matched) {
      accum["Technical Skill"].sum += r.score || 0;
      accum["Technical Skill"].count += 1;
    }
  });

  return CAREER_AXES.map((a) => {
    const { sum, count } = accum[a];
    const avg = count > 0 ? Math.round(sum / count) : 0;
    return { axis: a, value: Math.max(0, Math.min(100, avg)) };
  });
}

// -------------------- Small UI blocks --------------------
const Card: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children, className = "" }) => (
  <div className={`bg-[#0f111a] rounded-2xl p-4 shadow-sm border border-[#20232b] ${className}`}>{children}</div>
);
const SectionTitle: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-3 mb-3">
    <Activity size={18} />
    <h3 className="text-white font-semibold text-lg">{children}</h3>
  </div>
);

// -------------------- Custom charts (no Recharts) --------------------
// Polar spider (radar-like) implemented with SVG polygons
const PolarSpider: React.FC<{ data: { subject: string; value: number }[]; size?: number }> = ({ data, size = 320 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const count = data.length || 6;
  const angle = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;
  const polygonPoints = data.map((d, i) => {
    const r = (d.value / 100) * radius;
    const x = cx + r * Math.cos(angle(i));
    const y = cy + r * Math.sin(angle(i));
    return `${x},${y}`;
  }).join(' ');

  const rings = [0.25, 0.5, 0.75, 1].map((f) => {
    const points = Array.from({ length: count }).map((_, i) => {
      const r = radius * f;
      const x = cx + r * Math.cos(angle(i));
      const y = cy + r * Math.sin(angle(i));
      return `${x},${y}`;
    }).join(' ');
    return <polygon key={f} points={points} fill="none" stroke="#1f2937" strokeWidth={1} />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <defs>
        <linearGradient id="gradRadar" x1="0" x2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {rings}

      {data.map((d, i) => {
        const x = cx + (radius + 18) * Math.cos(angle(i));
        const y = cy + (radius + 18) * Math.sin(angle(i));
        return <text key={d.subject} x={x} y={y} fontSize={12} fill="#cbd5e1" textAnchor="middle">{d.subject}</text>;
      })}

      <polygon points={polygonPoints} fill="url(#gradRadar)" stroke="#7c3aed" strokeWidth={2} fillOpacity={0.25} />

    </svg>
  );
};

// Sparkline for timeline (simple path)
const Sparkline: React.FC<{ points: { x: string; y: number }[]; height?: number; width?: number }> = ({ points, height = 120, width = 600 }) => {
  if (!points || points.length === 0) return <div className="text-[#9aa3b2]">Không có dữ liệu.</div>;
  const maxY = Math.max(...points.map(p => p.y), 100);
  const minY = Math.min(...points.map(p => p.y), 0);
  const stepX = width / Math.max(1, points.length - 1);
  const path = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p.y - minY) / (maxY - minY || 1)) * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#sparkGrad)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const x = i * stepX;
        const y = height - ((p.y - minY) / (maxY - minY || 1)) * height;
        return <circle key={i} cx={x} cy={y} r={3} fill="#fff" />;
      })}
    </svg>
  );
};

// Horizontal skill bars (div-based)
const SkillBars: React.FC<{ skills: { name: string; current: number; target?: number }[] }> = ({ skills }) => {
  return (
    <div className="flex flex-col gap-3">
      {skills.map((s, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm text-[#cbd5e1] mb-1"><div>{s.name}</div><div>{s.current}% / {s.target ?? 100}%</div></div>
          <div className="w-full bg-[#0b1220] rounded-full h-3 overflow-hidden border border-[#222]"><div style={{ width: `${Math.max(0, Math.min(100, s.current))}%` }} className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700" /></div>
        </div>
      ))}
    </div>
  );
};

// -------------------- Component --------------------
export default function PhanTichNangLucPage({ radarData = [], timelineData = [], careerRecs = [], gptNotes = "", skills = [], certificates = [], suggestedCertificates = [] }: PageProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const safeRadar = Array.isArray(radarData) ? radarData : [];
  const safeTimeline = Array.isArray(timelineData) ? timelineData : [];
  const safeCareer = Array.isArray(careerRecs) ? careerRecs : [];
  const safeSkills = Array.isArray(skills) ? skills : [];
  const safeCertificates = Array.isArray(certificates) ? certificates : [];

  const careerAxes = useMemo(() => mapToCareerAxes(safeRadar), [safeRadar]);
  const radarChartData = useMemo(() => careerAxes.map((c) => ({ subject: c.axis, value: c.value })), [careerAxes]);

  const timelineByComp = useMemo(() => {
    const map: Record<string, TimelinePoint[]> = {};
    (safeTimeline || []).forEach(t => {
      if (!map[t.comp_id]) map[t.comp_id] = [];
      map[t.comp_id].push(t);
    });
    return map;
  }, [safeTimeline]);

  const compList = useMemo(() => safeRadar.map((r) => ({ id: r.comp_id, name: r.comp_name })), [safeRadar]);
  const [selectedComp, setSelectedComp] = useState<string | null>(compList[0]?.id ?? null);
  useEffect(() => { if (!selectedComp && compList[0]) setSelectedComp(compList[0].id); }, [compList, selectedComp]);

  const timelineForSelected = (selectedComp && timelineByComp[selectedComp]) ? timelineByComp[selectedComp].map(p => ({ x: p.date, y: p.score })) : [];

  const rpgNodes = useMemo(() => {
    const merged = new Map<string, { name: string; score: number }>();
    safeRadar.forEach(r => merged.set(r.comp_id, { name: r.comp_name, score: r.score }));
    safeSkills.forEach(s => merged.set(s.id, { name: s.name, score: s.current }));
    return Array.from(merged.entries()).map(([id, v]) => ({ comp_id: id, comp_name: v.name, score: v.score, level: Math.min(5, Math.max(1, Math.floor((v.score || 0) / 20) + 1)) }));
  }, [safeRadar, safeSkills]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white">🧭 Phân tích năng lực — phiên bản trực quan mới</h1>
        <div className="text-sm text-[#9aa3b2]">Thay Recharts bằng visual custom: spider, sparkline, skill bars, map</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <Card className="md:col-span-2">
          <SectionTitle>Radar năng lực nghề nghiệp (visual)</SectionTitle>
          <div className="flex items-center justify-center p-4">
            {mounted && radarChartData.length > 0 ? <PolarSpider data={radarChartData} size={360} /> : <div className="text-[#9aa3b2]">Không có dữ liệu radar.</div>}
          </div>
        </Card>

        <Card>
          <SectionTitle>Nghề nghiệp tiềm năng</SectionTitle>
          <div className="flex flex-col gap-3">
            {safeCareer.length === 0 ? (
              <div className="text-[#9aa3b2]">Không có gợi ý nghề nghiệp.</div>
            ) : (
              safeCareer.slice(0,5).map((r, idx) => (
                <div key={r.career_id ?? `c-${idx}`} className="p-3 rounded-xl border border-[#222] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{r.career_name}</div>
                      <div className="text-xs text-[#9aa3b2]">Phù hợp: {(Number(r.similarity ?? 0) * 100).toFixed(0)}%</div>
                    </div>
                    <button className="px-3 py-1 rounded-lg bg-[#1f2340] border border-[#2b2f40] text-white">Xem lộ trình</button>
                  </div>
                  {r.reason && <div className="text-xs text-[#d3bad6]">Lý do: {r.reason}</div>}
                  {Array.isArray(r.missing_gaps) && r.missing_gaps.length > 0 && (
                    <div className="text-xs text-[#d3bad6]">Gaps: {r.missing_gaps.map(g => `${g.comp_id}(${g.gap})`).join(', ')}</div>
                  )}
                  <div className="pt-2"><div className="w-full bg-[#0b1220] rounded-full h-3 overflow-hidden border border-[#222]"><div style={{ width: `${(Number(r.similarity ?? 0) * 100)}%` }} className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" /></div></div>
                </div>
              ))
            )}

            <div>
              <div className="text-xs text-[#9aa3b2] mb-2">Gợi ý chứng chỉ từ AI</div>
              {Array.isArray(suggestedCertificates) && suggestedCertificates.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {suggestedCertificates.map((c, i) => (
                    <div key={i} className="text-sm text-white p-2 rounded-md border border-[#222]">{c}</div>
                  ))}
                </div>
              ) : (
                <div className="text-[#9aa3b2]">Không có gợi ý chứng chỉ.</div>
              )}
            </div>

          </div>
        </Card>
      </div>

      {/* Timeline & selector */}
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between">
            <SectionTitle>Timeline phát triển năng lực (sparkline)</SectionTitle>
            <div className="flex items-center gap-2">
              <select
                value={selectedComp ?? ""}
                onChange={(e) => setSelectedComp(e.target.value)}
                className="bg-[#0f111a] border border-[#222] rounded-lg px-3 py-1 text-sm text-white"
              >
                {compList.map((c) => (
                  <option value={c.id} key={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ height: 260 }} className="p-2">
            {mounted && timelineForSelected.length > 0 ? (
              <div className="w-full h-full">
                <Sparkline points={timelineForSelected} height={200} width={700} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#9aa3b2]">Không có dữ liệu timeline cho năng lực này.</div>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle>Thống kê nhanh</SectionTitle>
          <div className="flex flex-col gap-3">
            <div className="text-xs text-[#9aa3b2]">Số năng lực được đo</div>
            <div className="text-2xl font-bold text-white">{safeRadar.length}</div>

            <div className="text-xs text-[#9aa3b2]">Level trung bình</div>
            <div className="text-2xl font-bold text-white">{Math.round((safeRadar.reduce((s, r) => s + (r.score || 0), 0) / Math.max(1, safeRadar.length)) / 20) || 1}</div>

            <div className="pt-2">{rpgNodes.slice(0,3).map(node => (
              <div key={node.comp_id} className="mb-2">
                <div className="flex justify-between text-sm text-[#9aa3b2]"><div>{node.comp_name}</div><div>{node.score}%</div></div>
                <div className="w-full bg-[#0b1220] rounded-full h-3 overflow-hidden border border-[#222]"><div style={{ width: `${node.score}%` }} className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" /></div>
              </div>
            ))}</div>
          </div>
        </Card>
      </div>

      {/* Skills table + SkillBars */}
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <SectionTitle>Bảng kỹ năng (hiện tại → mục tiêu)</SectionTitle>
          <div className="p-4">
            {safeSkills.length > 0 ? <SkillBars skills={safeSkills.map(s => ({ name: s.name, current: s.current, target: s.target }))} /> : <div className="text-[#9aa3b2]">Không có dữ liệu kỹ năng.</div>}
          </div>
        </Card>

        <Card>
          <SectionTitle>Bảng chứng chỉ</SectionTitle>
          <div className="overflow-auto max-h-60">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-[#9aa3b2] text-left">
                  <th className="pb-2">Chứng chỉ</th>
                  <th className="pb-2">Ảnh hưởng (%)</th>
                </tr>
              </thead>
              <tbody>
                {safeCertificates.length === 0 ? (
                  <tr><td colSpan={2} className="text-[#9aa3b2] py-2">Không có chứng chỉ.</td></tr>
                ) : (
                  safeCertificates.map((c, i) => (
                    <tr key={i} className="border-t border-[#111]">
                      <td className="py-2">{c.name}</td>
                      <td className="py-2">{c.impact}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* RPG Path (gamification) */}
      <div className="mt-4">
        <Card>
          <SectionTitle>🎮 Hành trình RPG định hướng nghề</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {rpgNodes.map((n) => (
              <motion.div key={n.comp_id} whileHover={{ scale: 1.02 }} className="p-3 rounded-xl border border-[#222] bg-[#07080b]">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-white">{n.comp_name}</div>
                  <div className="text-sm text-[#9aa3b2]">Lv{n.level}</div>
                </div>
                <div className="text-xs text-[#9aa3b2] mb-2">{n.score}%</div>
                <div className="w-full bg-[#0b1220] rounded-full h-3 overflow-hidden border border-[#222]"><div style={{ width: `${n.score}%` }} className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" /></div>
                <div className="mt-3 text-sm text-[#9aa3b2]">Unlocks: {(n.level >= 3) ? "Cơ hội nghề liên quan" : "Cần thêm điểm để unlock"}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4">
            <svg viewBox="0 0 1000 160" className="w-full h-40 rounded-xl bg-[#06060a] p-4">
              <polyline points="40,100 180,40 320,100 460,40 600,100 740,40 900,100" fill="none" stroke="#2b2f40" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
              {[40, 180, 320, 460, 600, 740, 900].map((x, i) => (
                <g key={i}>
                  <circle cx={x} cy={i % 2 === 0 ? 100 : 40} r={18} fill="#0b1220" stroke="#333" />
                  <text x={x} y={(i % 2 === 0 ? 100 : 40) + 5} fontSize={10} textAnchor="middle" fill="#9aa3b2">M{i + 1}</text>
                </g>
              ))}
            </svg>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <SectionTitle>Ghi chú từ GPT</SectionTitle>
          <pre className="whitespace-pre-wrap text-sm text-[#d1d5db] p-2 rounded-md bg-[#06060a]">{gptNotes || "Không có ghi chú từ GPT."}</pre>
        </Card>
      </div>

    </div>
  );
}

// -------------------- Server-side data fetch --------------------
export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx: GetServerSidePropsContext) => {
  const userId = (ctx.query?.userId as string) || "guest";

  // fallback demo
  let radarData: CompScore[] = [
    { comp_id: "communication", comp_name: "Communication", score: 65 },
    { comp_id: "teamwork", comp_name: "Teamwork", score: 70 },
    { comp_id: "programming", comp_name: "Programming", score: 60 },
    { comp_id: "critical", comp_name: "Critical Thinking", score: 55 },
    { comp_id: "digital", comp_name: "Digital Skills", score: 68 },
  ];

  let timelineData: TimelinePoint[] = [
    { date: "2024-09", comp_id: "programming", comp_name: "Programming", score: 48 },
    { date: "2025-01", comp_id: "programming", comp_name: "Programming", score: 56 },
    { date: "2025-05", comp_id: "programming", comp_name: "Programming", score: 62 },
    { date: "2025-08", comp_id: "programming", comp_name: "Programming", score: 65 },
  ];

  let careerRecs: CareerRec[] = [
    { career_id: "software_dev", career_name: "Software Developer", similarity: 0.86, reason: "Coding và tư duy giải quyết vấn đề mạnh" },
    { career_id: "data_analyst", career_name: "Data Analyst", similarity: 0.79, reason: "Tư duy logic, phân tích dữ liệu" },
    { career_id: "proj_coord", career_name: "Project Coordinator", similarity: 0.72, reason: "Kỹ năng teamwork và communication" },
  ];

  let gptNotes = "";

  let skills: SkillEntry[] = [
    { id: "communication", name: "Communication", current: 60, target: 80 },
    { id: "coding", name: "Coding", current: 75, target: 90 },
    { id: "critical", name: "Critical Thinking", current: 55, target: 75 },
  ];
  let certificates: CertificateEntry[] = [
    { name: "IELTS", impact: 30 },
    { name: "MOS Excel", impact: 20 },
    { name: "Google Data Cert", impact: 50 },
  ];
  let suggestedCertificates: string[] = ["Google Data Analytics", "Coursera UX Design", "Agile PM Certificate"];

  try {
    const results = await getLearningResultsByUser(userId);
    if (results && results.length > 0) {
      const ai = await getGeminiAnalysis(results);

      // radar
      if (Array.isArray(ai?.radarChartData)) {
        radarData = ai.radarChartData.map((r: any) => ({
          comp_id: String((r.subject || r.label || r.comp_name || "").toString().toLowerCase().replace(/\s+/g, "_")),
          comp_name: String(r.subject || r.label || r.comp_name || ""),
          score: normalizeScore(Number(r.score ?? 0)),
        }));
      }

      // timeline / trend
      if (Array.isArray(ai?.trendChartData)) {
        const timeline: TimelinePoint[] = [];
        ai.trendChartData.forEach((row: any) => {
          const dateLabel = String(row.name || row.period || "");
          Object.keys(row).forEach((k) => {
            if (k === "name" || k === "period") return;
            const rawScore = Number(row[k]);
            if (!Number.isNaN(rawScore)) {
              const compId = String(k).toLowerCase().replace(/\s+/g, "_");
              timeline.push({ date: dateLabel, comp_id: compId, comp_name: String(k), score: normalizeScore(rawScore) });
            }
          });
        });
        if (timeline.length > 0) timelineData = timeline;
      }

      // career recs
      if (Array.isArray(ai?.career_recommendations)) {
        careerRecs = ai.career_recommendations.map((c: any) => ({
          career_id: c.career_id ?? String((c.career_name || c.name || "").toLowerCase().replace(/\s+/g, "_")),
          career_name: c.career_name ?? c.name ?? "Unknown",
          similarity: Number(c.similarity ?? 0),
          missing_gaps: Array.isArray(c.missing_gaps) ? c.missing_gaps.map((g: any) => ({ comp_id: g.comp_id, gap: Number(g.gap) })) : undefined,
          reason: c.reason ?? c.explanation ?? undefined,
        }));
      }

      if (Array.isArray(ai?.skills)) {
        skills = ai.skills.map((s: any) => ({ id: s.id ?? String((s.name || "").toLowerCase().replace(/\s+/g, "_")), name: s.name ?? s.label ?? "", current: normalizeScore(Number(s.current ?? 0)), target: s.target ? normalizeScore(Number(s.target)) : undefined }));
      }

      if (Array.isArray(ai?.certificates)) {
        certificates = ai.certificates.map((c: any) => ({ name: c.name ?? c.label ?? "", impact: Number(c.impact ?? 0) }));
      }

      if (Array.isArray(ai?.suggestedCertificates)) {
        suggestedCertificates = ai.suggestedCertificates.map((c: any) => String(c));
      }

      gptNotes = String(ai?.overallSummary || ai?.notes || ai?.note || "");
    } else {
      gptNotes = "Không có dữ liệu học tập để phân tích — hiển thị dữ liệu mẫu.";
    }
  } catch (err: any) {
    console.error("getServerSideProps - analysis error:", err);
    gptNotes = `Lỗi khi phân tích (fallback dữ liệu mẫu): ${err?.message ?? String(err)}`;
  }

  return {
    props: { radarData, timelineData, careerRecs, gptNotes, skills, certificates, suggestedCertificates },
  };
};

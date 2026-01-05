// FILE: src/app/pages/neovana/DinhHuongPhatTrienPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import {
  addCareerDashboard,
  getCareerDashboardsByUser,
} from "../../../services/careerDashboardService";
import { generateCareerDashboard } from "../../../services/neovanaDashboardService";

import { CareerDashboard, SkillToImprove } from "../../../types/CareerDashboard";

import CareersCard from "./components_dinhhuong/CareersCard";
import SkillsCard, { Skill } from "./components_dinhhuong/SkillsCard";
import CertificatesCard from "./components_dinhhuong/CertificatesCard";
import SubjectsCard from "./components_dinhhuong/SubjectsCard";
import SummaryCard from "./components_dinhhuong/SummaryCard";
import SuggestionDialog from "./components_dinhhuong/SuggestionDialog";

import "./timeline.css";
import { useFirebaseUser } from "../../hooks/useFirebaseUser";
import { toast } from "react-toastify";
import { industrySkillProfiles } from "./data/industrySkills";
import { explainMatch } from "../../../utils/matchExplanation";
import { generateRoadmap } from "../../../utils/careerRoadmap";

const SKILL_LABELS: Record<string, string> = {
  logic: "Tư duy logic",
  problemSolving: "Giải quyết vấn đề",
  selfLearning: "Tự học",
  communication: "Giao tiếp",
  teamwork: "Làm việc nhóm",
};

interface IndustryProfile {
  description: string;
  coreSkills: string[];
  keySubjects: string[];
  workEnv: string;
  roles: string[];
  skills: Record<string, number>; // 0-100
}

type SkillGapItem = { skill: string; gap: number };

const floatingCardStyle: React.CSSProperties = {
  borderRadius: 20,
  background: "linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)",
  boxShadow: "0 20px 50px rgba(79,70,229,0.18)",
  border: "1px solid rgba(79,70,229,0.18)",
  marginBottom: 24,
};

const softCardStyle: React.CSSProperties = {
  borderRadius: 20,
  background: "#fff",
  boxShadow: "0 12px 35px rgba(0,0,0,0.08)",
  border: "1px solid rgba(0,0,0,0.06)",
  marginBottom: 24,
};

function pct(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function buildUserSkills(selected?: CareerDashboard | null) {
  // Ưu tiên data backend nếu có
  const fromBackend = (selected as any)?.userSkills as Record<string, number> | undefined;
  if (fromBackend && typeof fromBackend === "object") return fromBackend;

  // Fallback: lấy từ skillsToImprove.priorityRatio (%)
  const arr = selected?.skillsToImprove || [];
  const map: Record<string, number> = {};
  arr.forEach((s) => {
    map[s.name] = pct(Number((s as any).priorityRatio) || 0);
  });
  return map;
}

function getAllSkillsUnion(a: SkillGapItem[], b: SkillGapItem[]) {
  const set = new Set<string>();
  a.forEach((x) => set.add(x.skill));
  b.forEach((x) => set.add(x.skill));
  return Array.from(set);
}

function toGapMap(gaps: SkillGapItem[]) {
  const map: Record<string, number> = {};
  gaps.forEach((g) => (map[g.skill] = pct(g.gap)));
  return map;
}

function computeSkillGap(
  userSkills: Record<string, number>,
  selectedCareer: string
): SkillGapItem[] {
  const industryProfile = industrySkillProfiles[selectedCareer] as IndustryProfile | undefined;

  if (!industryProfile || !industryProfile.skills) return [];

  const industrySkills = industryProfile.skills;
  const skillGaps: SkillGapItem[] = [];

  for (const skillName in industrySkills) {
    if (Object.prototype.hasOwnProperty.call(industrySkills, skillName)) {
      const industryProficiency = pct(industrySkills[skillName]);
      const userProficiency = pct(userSkills[skillName] || 0);
      const gap = Math.max(0, industryProficiency - userProficiency);
      skillGaps.push({ skill: skillName, gap });
    }
  }

  return skillGaps.filter((x) => x.gap > 0).sort((a, b) => b.gap - a.gap);
}

/** Radar SVG đơn giản (không cần lib) + hỗ trợ compare 2 ngành */
interface SkillGapRadarProps {
  axes: string[];
  seriesA: { label: string; map: Record<string, number> };
  seriesB?: { label: string; map: Record<string, number> };
}

const SkillGapRadar: React.FC<SkillGapRadarProps> = ({
  axes,
  seriesA,
  seriesB,
}) => {
  const dataA = axes.map((skill) => ({
    skill,
    valueA: seriesA.map[skill] || 0,
    valueB: seriesB?.map?.[skill] || null,
  }));


  if (!dataA || dataA.length === 0) {
     return (
      <Typography sx={{ mt: 2 }}>
        Không có khoảng cách kỹ năng đáng kể với ngành này.
      </Typography>
    );
  }

    const maxGap = Math.max(...dataA.map((d) => d.valueA));

  return (
    <Box
      sx={{
        mt: 2,
        p: 3,
        borderRadius: 3,
        background: "#f8f9ff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      <Typography sx={{ fontWeight: 800, mb: 2 }}>
        🧠 Phân tích chi tiết từng kỹ năng
      </Typography>

      {dataA.map((item, index) => {
        const isMax = item.valueA === maxGap;

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              background: isMax ? "#eef2ff" : "#fff",
              border: isMax
                ? "2px solid #4f46e5"
                : "1px solid #e0e0e0",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>
              {item.skill}
              {isMax && (
                <span style={{ color: "#4f46e5", marginLeft: 8 }}>
                  ⭐ Khoảng cách lớn nhất
                </span>
              )}
            </Typography>

            <Typography sx={{ fontSize: 14, mt: 0.5 }}>
              Khoảng cách hiện tại: <strong>{item.valueA}</strong> điểm
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

const DinhHuongPhatTrienPage: React.FC = () => {
  // import ...

// ====== UTILS / HELPERS (ĐẶT Ở ĐÂY) ======
function getMatchedSkillCount(
  userSkills: Record<string, number>,
  industrySkills: Record<string, number>
) {
  return Object.keys(industrySkills).filter(
    (s) => userSkills[s] !== undefined
  ).length;
}

// (các helper khác nếu có: pct, normalizePercent, calculateReadiness...)

// ====== COMPONENT ======

  const [dashboards, setDashboards] = useState<CareerDashboard[]>([]);
  const [selected, setSelected] = useState<CareerDashboard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ⭐ Loading Overlay
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  // Compare 2 ngành
  const [compareCareer, setCompareCareer] = useState<string>("");

  // Firebase userId
  const { userId } = useFirebaseUser();

  // LOAD dashboards
  const loadDashboards = async () => {
    if (!userId) return;

    const data = (await getCareerDashboardsByUser(userId)) || [];
    const sorted = data.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setDashboards(sorted);
    if (sorted.length > 0) setSelected(sorted[0]);
  };

  useEffect(() => {
    if (!userId) return;
    loadDashboards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // HANDLE CREATE
  const handleCreate = () => setDialogOpen(true);

  const handleDialogSubmit = async (formData: any) => {
    if (!userId) return toast.error("Không tìm thấy userId");

    setAiLoading(true);
    setAiDone(false);

    try {
      const dashboard = await generateCareerDashboard(userId, formData);
      (dashboard as any).userId = userId;

      const saved = await addCareerDashboard(dashboard);
      await loadDashboards();
      setSelected(saved);

      setAiDone(true);
      toast.success("AI đã phân tích xong!");

      setTimeout(() => setAiDone(false), 1800);
    } catch (error) {
      toast.error("AI phân tích không thành công");
    } finally {
      setAiLoading(false);
      setDialogOpen(false);
    }
  };

  // MAP SKILLS FIX %
  const mapSkills = (skills: SkillToImprove[]): Skill[] =>
    skills.map((s) => ({
      name: s.name,
      priority: Number((s as any).priority) || 0,
      priorityRatio: (Number((s as any).priorityRatio) || 0) * 100,
      reason: (s as any).reason || "",
    }));

  const sortedCareers = useMemo(() => {
    return [...(selected?.careers || [])].sort(
      (a, b) => Number((b as any).fitScore ?? 0) - Number((a as any).fitScore ?? 0)
    );
  }, [selected?.careers]);

  const topCareer = sortedCareers[0];
  const selectedCareer = topCareer?.name ?? "Công nghệ thông tin";

  // auto pick compare career = ngành top 2
  useEffect(() => {
    const second = sortedCareers?.[1]?.name;
    if (!compareCareer && second) setCompareCareer(second);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedCareers?.length, selectedCareer]);

  const userSkills = useMemo(() => buildUserSkills(selected), [selected]);

  const skillGapDataA = useMemo(
    () => computeSkillGap(userSkills, selectedCareer),
    [userSkills, selectedCareer]
  );

  const skillGapDataB = useMemo(() => {
    if (!compareCareer || compareCareer === selectedCareer) return [];
    return computeSkillGap(userSkills, compareCareer);
  }, [userSkills, compareCareer, selectedCareer]);
  
// ===== READINESS CALCULATION =====
const industrySkillsA = industrySkillProfiles[selectedCareer]?.skills || {};
const matchedCountA = getMatchedSkillCount(userSkills, industrySkillsA);

const readinessA =
  matchedCountA === 0
    ? null
    : calculateReadiness(userSkills, industrySkillsA);

const readinessB =
  compareCareer && industrySkillProfiles[compareCareer]
    ? calculateReadiness(
        userSkills,
        industrySkillProfiles[compareCareer].skills
      )
    : null;

  const biggestSkillGapA = skillGapDataA?.[0];
  const biggestSkillGapB = skillGapDataB?.[0];

  const roadmap = useMemo(() => generateRoadmap(selectedCareer), [selectedCareer]);

  const industry = (industrySkillProfiles[selectedCareer] as IndustryProfile | undefined) || undefined;
  const matchReasons = explainMatch(topCareer, selected) || [];
  // ================== UTILS: NORMALIZE % ==================
const normalizePercent = (raw: any): number => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;

  // 0..1 → %
  if (n > 0 && n <= 1) return Math.round(n * 100);

  // 0..10 → %
  if (n > 1 && n <= 10) return Math.round(n * 10);

  // 0..100
  return Math.round(n);
};

const clamp01_100 = (v: number): number =>
  Math.max(0, Math.min(100, v));


    // ===== AI explanation theo từng trục kỹ năng =====

const axes = useMemo(
  () => Object.keys(industry?.skills || {}),
  [industry]
);


const axisExplanations = useMemo(() => {
  const reqA =
    (industrySkillProfiles[selectedCareer] as any)?.skills || {};
  const reqB = compareCareer
    ? (industrySkillProfiles[compareCareer] as any)?.skills || {}
    : {};

  return axes.map((skill) => {
    const requiredA = clamp01_100(reqA?.[skill] ?? 0);
    const requiredB = clamp01_100(reqB?.[skill] ?? 0);
    const current = clamp01_100(userSkills?.[skill] ?? 0);

    const gapA = clamp01_100(requiredA - current);
    const gapB = clamp01_100(requiredB - current);

    let text = "";
    if (gapA >= 30)
      text =
        "Kỹ năng này đang thiếu nhiều so với yêu cầu ngành. Nên ưu tiên học sớm.";
    else if (gapA >= 15)
      text =
        "Bạn có nền tảng nhưng cần luyện thêm để theo kịp yêu cầu thực tế.";
    else
      text =
        "Mức độ hiện tại khá phù hợp với yêu cầu ngành, nên duy trì và nâng cao.";

    return {
      skill,
      ga: gapA,
      gb: compareCareer ? gapB : 0,
      current,
      requiredA,
      requiredB,
      text,
    };
  });
}, [axes, userSkills, selectedCareer, compareCareer]);


function calculateReadiness(
  userSkills: Record<string, number>,
  industrySkills: Record<string, number>
): number {
  let totalIndustry = 0;
  let totalUser = 0;

  for (const skill in industrySkills) {
    const industryLevel = industrySkills[skill];
    const userLevel = userSkills[skill] ?? 0;

    totalIndustry += industryLevel;
    totalUser += Math.min(userLevel, industryLevel); 
    // 👈 không cho vượt quá yêu cầu ngành
  }

  if (totalIndustry === 0) return 0;

  return Math.round((totalUser / totalIndustry) * 100);
}


  

  return (
    <>
      {/* ============================================= */}
      {/*           FULL SCREEN AI LOADING OVERLAY      */}
      {/* ============================================= */}
      {(aiLoading || aiDone) && (
        <div className={`ai-overlay ${aiDone ? "fade-out" : "fade-in"}`}>
          <div className="ai-box">
            {aiLoading && (
              <>
                <div className="spinner"></div>
                <p className="ai-text">AI đang phân tích dữ liệu của bạn...</p>
              </>
            )}
            {aiDone && <p className="ai-text-done">✅ AI đã phân tích xong!</p>}
          </div>
        </div>
      )}

      {/* ===================== OVERLAY CSS ===================== */}
      <style>{`
        .ai-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.45);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          backdrop-filter: blur(3px);
          transition: opacity .4s ease;
        }
        .fade-in { opacity: 1; }
        .fade-out { opacity: 0; }

        .ai-box {
          background: white;
          padding: 30px 40px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          animation: popup .3s ease;
        }
        @keyframes popup {
          from { transform: scale(.8); opacity: 0;}
          to { transform: scale(1); opacity: 1;}
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 5px solid #ddd;
          border-top-color: #3498db;
          border-radius: 50%;
          animation: spin .9s linear infinite;
          margin: auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ai-text { font-size: 18px; font-weight: 600; margin-top: 18px; color: #333; }
        .ai-text-done { font-size: 22px; font-weight: 700; color: #2ecc71; }
      `}</style>

      {/* ============================================= */}
      {/*                   PAGE LAYOUT                */}
      {/* ============================================= */}
      <div className="row g-0 g-xl-5 g-xxl-8">
        {/* LEFT COLUMN */}
        <div className="col-xxl-4">
          {/* NHẬP THÔNG TIN */}
          <div className="card mb-5">
            <div className="card-body">
              <div className="d-flex bg-light-primary card-rounded flex-grow-1">
                <div className="py-10 ps-7">
                  <span className="fw-bolder fs-1 text-gray-800">Nhập thông tin</span>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleCreate}
                    className="btn-create-dashboard hover:bg-blue-600 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md transition-all ease-in-out duration-300"
                  >
                    Định hướng
                  </Button>
                </div>

                <div
                  className="position-relative bgi-no-repeat bgi-size-contain bgi-position-y-bottom bgi-position-x-end mt-6 flex-grow-1"
                  style={{ backgroundImage: `url("/media/misc/illustration-1.png")` }}
                ></div>
              </div>
            </div>
          </div>

          {/* ===================== TIMELINE ===================== */}
          <div className="card mb-5">
            <div className="card-body">
              <Typography variant="h6">Lịch sử</Typography>

              <div className="neovana-timeline">
                {dashboards.map((d) => {
                  const isSelected = selected?.id === d.id;
                  return (
                    <div key={d.id} className="timeline-item">
                      <div className="timeline-line"></div>
                      <div className="timeline-dot"></div>

                      <button
                        type="button"
                        className={`timeline-card ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelected(d)}
                      >
                        <div className="timeline-title">{d.title}</div>

                        <div className="timeline-date">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===================== TIMELINE CSS ===================== */}
          <style>{`
            .neovana-timeline {
              padding-left: 40px;
              margin-top: 12px;
              display: flex;
              flex-direction: column;
              gap: 20px;
            }

            .timeline-item {
              position: relative;
              display: flex;
            }

            .timeline-line {
              position: absolute;
              left: 12px;
              top: 0;
              bottom: -20px;
              width: 2px;
              background: #e6c9b8;
              opacity: .9;
            }

            .timeline-dot {
              position: absolute;
              left: 6px;
              top: 18px;
              width: 14px;
              height: 14px;
              background: #fff;
              border: 3px solid #ff8c5a;
              border-radius: 50%;
              box-shadow: 0 0 6px rgba(255, 140, 90, 0.4);
            }

            .timeline-card {
              background: #fff;
              padding: 14px 20px;
              border-radius: 14px;
              border: 1px solid #eee;
              width: 100%;
              text-align: left;
              display: flex;
              flex-direction: column;
              gap: 6px;
              transition: .25s;
              box-shadow: 0 2px 4px rgba(0,0,0,.06);
            }

            .timeline-card:hover {
              transform: translateX(6px);
              box-shadow: 0 6px 16px rgba(0,0,0,.08);
              border-color: #ffd1b8;
            }

            .timeline-card.selected {
              background: #ffe8dc !important;
              border-color: #ffb08a !important;
              transform: translateX(8px);
              box-shadow: 0 8px 18px rgba(255, 140, 90, .25);
            }

            .timeline-title {
              font-size: 15.5px;
              font-weight: 600;
              color: #333;
            }

            .timeline-date {
              font-size: 14px;
              font-weight: 700;
              color: #444;
              margin-top: 2px;
            }
          `}</style>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-xxl-8">
          {selected ? (
            <Box>
              <SummaryCard dashboard={selected} />



              {/* ⭐ INDUSTRY PROFILE & MATCH REASONING */}

              {matchReasons.length > 0 && (
                <div className="card p-4" style={softCardStyle}>
                  <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
                    📌 Vì sao phù hợp ngành "{selectedCareer}"?
                  </h3>
                  <ul>
                    {matchReasons.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {roadmap.length > 0 && (
  <div
    className="card p-4 mt-4"
    style={{
      borderRadius: 22,
      background: "linear-gradient(135deg, #eef2ff, #ffffff)",
      boxShadow: "0 12px 30px rgba(79,70,229,0.25)",
      border: "1px solid rgba(79,70,229,0.2)",
    }}
  >
    <h3 style={{ fontWeight: 900, fontSize: 22, marginBottom: 14 }}>
      🚀 Lộ trình 90 ngày theo ngành "{selectedCareer}"
    </h3>

    {roadmap.map((step, i) => (
      <div
        key={i}
        style={{
          marginBottom: 12,
          padding: "10px 14px",
          borderRadius: 14,
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <strong style={{ color: "#4f46e5" }}>
          Tuần {step.week}:
        </strong>{" "}
        {step.task}
      </div>
    ))}

    <Typography sx={{ mt: 2, fontStyle: "italic", color: "#555" }}>
      🤖 AI gợi ý: Nếu bạn hoàn thành đều đặn lộ trình này, mức độ phù hợp với
      ngành sẽ được cải thiện rõ rệt sau 3 tháng.
    </Typography>
  </div>
)}



              <Box sx={{ mt: 6 }}>
     <CareersCard
  careers={sortedCareers.map((c) => ({
    ...c,
    percent: clamp01_100(normalizePercent(c.fitScore ?? c.percent)),
  }))}
/>



            </Box>

            </Box>
          ) : (
            <Typography>Chưa có dữ liệu.</Typography>
          )}
        </div>
      </div>

      {/* SKILLS + CERTIFICATES */}
      <div className="row g-0 g-xl-5 g-xxl-8 mt-4">
        <div className="col-xxl-6 p-4">
          {selected ? (
            <SkillsCard skills={mapSkills(selected.skillsToImprove || [])} />
          ) : (
            <Typography>Không có dữ liệu.</Typography>
          )}
        </div>

        <div className="col-xxl-6 p-4">
          {selected ? (
            <CertificatesCard certificates={selected.certificatesToAdd || []} />
          ) : (
            <Typography>Chưa có dữ liệu.</Typography>
          )}
        </div>

        {/* SUBJECTS */}
        <div className="row g-0 g-xl-5 g-xxl-8 mt-4">
          <div className="col-xxl-12 p-4">
            {selected ? (
              <SubjectsCard subjects={selected.subjectsToFocus || []} />
            ) : (
              <Typography>Chưa có dữ liệu.</Typography>
            )}
          </div>
        </div>

        {/* DIALOG */}
        <SuggestionDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleDialogSubmit}
        />
      </div>
    </>
  );
};

export default DinhHuongPhatTrienPage;
function getMatchedSkillCount(
  userSkills: Record<string, number>,
  industrySkills: Record<string, number>
): number {
  let count = 0;
  for (const skill in industrySkills) {
    if (
      Object.prototype.hasOwnProperty.call(industrySkills, skill) &&
      (userSkills[skill] ?? 0) > 0
    ) {
      count++;
    }
  }
  return count;
}


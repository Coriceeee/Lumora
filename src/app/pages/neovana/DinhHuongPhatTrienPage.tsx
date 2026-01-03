// FILE: src/app/pages/neovana/DinhHuongPhatTrienPage.tsx

import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import {
  addCareerDashboard,
  getCareerDashboardsByUser,
} from "../../../services/careerDashboardService";
import { generateCareerDashboard } from "../../../services/neovanaDashboardService";

import {
  CareerDashboard,
  SkillToImprove,
} from "../../../types/CareerDashboard";

import CareersCard from "./components_dinhhuong/CareersCard";
import SkillsCard, { Skill } from "./components_dinhhuong/SkillsCard";
import CertificatesCard from "./components_dinhhuong/CertificatesCard";
import SubjectsCard from "./components_dinhhuong/SubjectsCard";
import SummaryCard from "./components_dinhhuong/SummaryCard";
import SuggestionDialog from "./components_dinhhuong/SuggestionDialog";

import "./timeline.css";
import { useFirebaseUser } from "../../hooks/useFirebaseUser";
import { toast } from "react-toastify";
import CareerFitMatrix from "./components_dinhhuong/CareerFitMatrix";
import { industrySkillProfiles } from "./data/industrySkills";
import { explainMatch } from "../../../utils/matchExplanation";
import { generateRoadmap } from "../../../utils/careerRoadmap";


interface IndustryProfile {
  description: string;
  coreSkills: string[];
  keySubjects: string[];
  workEnv: string;
  roles: string[];
  skills: Record<string, number>; // Assuming 'skills' is also part of this profile
}


const DinhHuongPhatTrienPage: React.FC = () => {
  const [dashboards, setDashboards] = useState<CareerDashboard[]>([]);
  const [selected, setSelected] = useState<CareerDashboard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ⭐ Loading Overlay
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  // Firebase userId
  const { userId } = useFirebaseUser();

  // LOAD dashboards
  const loadDashboards = async () => {
    if (!userId) return;

  const data = await getCareerDashboardsByUser(userId) || [];

    const sorted = data.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setDashboards(sorted);

    if (sorted.length > 0) setSelected(sorted[0]);
  };

  useEffect(() => {
    if (!userId) return;
    loadDashboards();
  }, [userId]);

  // HANDLE CREATE
  const handleCreate = () => setDialogOpen(true);

  const handleDialogSubmit = async (formData: any) => {
    if (!userId) return toast.error("Không tìm thấy userId");

    setAiLoading(true);
    setAiDone(false);

    try {
      const dashboard = await generateCareerDashboard(userId, formData);
      dashboard.userId = userId;

      const saved = await addCareerDashboard(dashboard);
      await loadDashboards();
      setSelected(saved);

      setAiDone(true);
      toast.success("AI đã phân tích xong!");

      setTimeout(() => {
        setAiDone(false);
      }, 1800);
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
    priority: Number(s.priority) || 0,
    priorityRatio: (Number(s.priorityRatio) || 0) * 100,
    reason: s.reason || "",
  }));

const sortedCareers = [...(selected?.careers || [])].sort(
  (a, b) => Number(b.fitScore ?? 0) - Number(a.fitScore ?? 0)
);

const topCareer = sortedCareers[0];

const selectedCareer = topCareer?.name ?? "Công nghệ thông tin";

// lưu ý: nếu backend trả key khác thì sửa tại đây
const userSkills =
  selected?.userSkills ??
  Object.fromEntries(
    (selected?.skillsToImprove || []).map(s => [
      s.name,
      Number(s.priorityRatio) || 0,
    ])
  );


const skillGapData = computeSkillGap(userSkills, selectedCareer);
const roadmap = generateRoadmap(selectedCareer);

// Cast 'industry' to the newly defined IndustryProfile type
// to ensure TypeScript recognizes properties like 'description'.
const industry = industrySkillProfiles[selectedCareer] as IndustryProfile | undefined;
const matchReasons = explainMatch(topCareer, selected) || [];
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
              font-weight: 700;   /* ⭐ In đậm */
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
              <CareerFitMatrix careers={selected.careers || []} />
            
              {skillGapData && (
                <div className="card p-4" style={{ borderRadius: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>
                    🌟 Khoảng cách kỹ năng với ngành "{selectedCareer}"
                  </h3>
                  <SkillGapRadar data={skillGapData.map(item => ({ skill: item.skill, value: item.gap }))} />
                </div>
              )}
              {/* ⭐ INDUSTRY PROFILE & MATCH REASONING */}
              {industry && (
                <div className="card p-4" style={{ borderRadius: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
                    🧠 Hồ sơ ngành "{selectedCareer}"
                  </h3>
                  <p style={{ marginBottom: 12 }}>{industry.description}</p>

                  <div>
                    <strong>Kỹ năng lõi:</strong>
                    <ul>
  {(industry.coreSkills ?? []).map((s, i) => (
    <li key={i}>{s}</li>
  ))}
</ul>
                    <strong>Môn học quan trọng:</strong>
                    <ul>
  {(industry.keySubjects ?? []).map((s, i) => (
    <li key={i}>{s}</li>
  ))}
</ul>
                    <strong>Môi trường làm việc:</strong>
                    <p>{industry.workEnv}</p>

                    <strong>Vai trò phổ biến:</strong>
<ul>
  {(industry.roles ?? []).map((r, i) => (
    <li key={i}>{r}</li>
  ))}
</ul>                  </div>
                </div>
              )}
              {matchReasons.length > 0 && (
                <div className="card p-4" style={{ borderRadius: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
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
              <div className="card p-4" style={{ borderRadius: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>
                  🚀 Lộ trình 90 ngày theo ngành "{selectedCareer}"
                </h3>

                {roadmap.map((step, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <strong>Tuần {step.week}:</strong> {step.task}
                  </div>
                ))}
              </div>
            )}

              <CareersCard
          careers={sortedCareers.map(c => ({
            ...c,
            percent: c.fitScore ?? c.percent ?? 0,
          }))}
        />

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
        <SuggestionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleDialogSubmit} />
      </div>
    </>
  );
};

const SkillGapRadar: React.FC<{ data: { skill: string; value: number }[] }> = ({
  data,
}) => {
  // In a real application, this would be a sophisticated radar chart component
  // For demonstration, we'll just show the data as a list.
  if (data.length === 0) {
    return <Typography sx={{ mt: 2 }}>Không có dữ liệu khoảng cách kỹ năng cho ngành này.</Typography>;
  }

  return (
    <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: 2, background: "#fafafa" }}>
      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
        Chi tiết khoảng cách kỹ năng:
      </Typography>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            {item.skill}: {item.value} điểm
          </li>
        ))}
      </ul>
    </Box>
  );
};

function computeSkillGap(
  userSkills: Record<string, number>,
  selectedCareer: string
) {
  const industryProfile = industrySkillProfiles[selectedCareer];

  if (!industryProfile || !industryProfile.skills) {
    return []; // No industry profile or skills defined for this career
  }

  const skillGaps: { skill: string; gap: number }[] = [];
  const industrySkills = industryProfile.skills;

  // Iterate over the skills defined for the industry
  for (const skillName in industrySkills) {
    if (Object.prototype.hasOwnProperty.call(industrySkills, skillName)) {
      const industryProficiency = industrySkills[skillName]; // Expected proficiency from industry
      const userProficiency = userSkills[skillName] || 0; // User's actual proficiency, default to 0

      // Calculate the gap. A positive gap means the user needs to improve.
      const gap = Math.max(0, industryProficiency - userProficiency);

      skillGaps.push({ skill: skillName, gap: gap });
    }
  }

  // Optionally, sort by gap (highest gap first) or filter out skills with 0 gap
  return skillGaps.filter(item => item.gap > 0).sort((a, b) => b.gap - a.gap);
}

export default DinhHuongPhatTrienPage;


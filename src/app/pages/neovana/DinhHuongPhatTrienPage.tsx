import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import {
  addCareerDashboard,
  getCareerDashboardsByUser,
} from "../../../services/careerDashboardService";
import { generateCareerDashboard } from "../../../services/neovanaDashboardService";
import {
  CareerDashboard,
  SkillToImprove,
} from "../../../types/CareerDashboard";
import CareersCard from "./components/CareersCard";
import SkillsCard, { Skill } from "./components/SkillsCard";
import CertificatesCard from "./components/CertificatesCard";
import SubjectsCard from "./components/SubjectsCard";
import SummaryCard from "./components/SummaryCard";
import SuggestionDialog from "./components/SuggestionDialog";

const userId = "user_fake_id_123456";

const DinhHuongPhatTrienPage: React.FC = () => {
  const [dashboards, setDashboards] = useState<CareerDashboard[]>([]);
  const [selected, setSelected] = useState<CareerDashboard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadDashboards = async () => {
    const data = await getCareerDashboardsByUser();
    setDashboards(data);
    if (data.length > 0) setSelected(data[0]);
  };

  useEffect(() => {
    loadDashboards();
  }, []);

  const handleCreate = () => {
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (formData: {
    strengths: string;
    interests: string;
    personality: string;
    dreamJob: string;
  }) => {
    const dashboard = await generateCareerDashboard(userId, formData);
    const saved = await addCareerDashboard(dashboard);
    await loadDashboards();
    setSelected(saved);
    setDialogOpen(false);
  };

  const mapSkills = (skills: SkillToImprove[]): Skill[] =>
    skills.map((s) => ({
      name: s.name,
      priority: Number(s.priority),
      priorityRatio: s.priorityRatio,
      reason: s.reason,
    }));

  return (
    <>
      <div className="row g-0 g-xl-5 g-xxl-8">
        <div className="col-xxl-4">
          <div className="card mb-5">
            <div className="card-body">
              <div className="d-flex bg-light-primary card-rounded flex-grow-1">
                <div className="py-10 ps-7">
                  <div className="">
                    <span className="font-weight-light fs-1 text-gray-800">
                      <span className="fw-bolder fs-1 text-gray-800">Nhập thông tin</span>
                    </span>
                  </div>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleCreate}
                    sx={{
                      borderRadius: "30px",
                      backgroundColor: "#A8D8FF",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#7BB9E0",
                      },
                      transition: "all 0.3s ease-in-out", // Thêm hiệu ứng
                    }}
                  >
                    Tạo Career Dashboard
                  </Button>
                </div>
                <div
                  className="position-relative bgi-no-repeat bgi-size-contain bgi-position-y-bottom bgi-position-x-end mt-6 flex-grow-1"
                  style={{
                    backgroundImage: `url("/media/misc/illustration-1.png")`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="card mb-5">
            <div className="card-body">
              <Typography variant="h6" sx={{ fontSize: "1.2rem", fontWeight: "600", color: "#4E81A8" }}>
                Lịch sử Dashboard
              </Typography>
              {dashboards.map((d) => (
                <Button
                  key={d.id}
                  fullWidth
                  variant={selected?.id === d.id ? "contained" : "outlined"}
                  sx={{
                    mt: 1,
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#D1E9FF", // Thêm hiệu ứng khi hover
                    },
                  }}
                  onClick={() => setSelected(d)}
                >
                  {d.title || "Dashboard"} ({new Date(d.createdAt).toLocaleDateString()})
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xxl-8 gy-0 gy-xxl-8">
          {selected ? (
            <Box display="flex" flexDirection="column" gap={2}>
              <SummaryCard dashboard={selected} />
              <CareersCard careers={selected.careers} />
              <SkillsCard skills={mapSkills(selected.skillsToImprove || [])} />
              <CertificatesCard certificates={selected.certificatesToAdd || []} />
              <SubjectsCard subjects={selected.subjectsToFocus || []} />
            </Box>
          ) : (
            <Typography>Chưa có dữ liệu.</Typography>
          )}
        </div>
      </div>

      <SuggestionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
      />
    </>
  );
};

export default DinhHuongPhatTrienPage;

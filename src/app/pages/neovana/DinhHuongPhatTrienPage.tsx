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

const DinhHuongPhatTrienPage: React.FC = () => {
  const [dashboards, setDashboards] = useState<CareerDashboard[]>([]);
  const [selected, setSelected] = useState<CareerDashboard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ✅ dùng hook để đảm bảo userId có giá trị hợp lệ
  const { userId, loading: authLoading } = useFirebaseUser();

  const loadDashboards = async () => {
    if (!userId) {
      console.warn("⚠️ userId chưa sẵn sàng, bỏ qua tải dữ liệu dashboard.");
      return;
    }

    const data = await getCareerDashboardsByUser(userId);
    setDashboards(data);
    if (data.length > 0) setSelected(data[0]);
  };

  useEffect(() => {
    if (authLoading) return; // ⏳ chờ xác thực
    loadDashboards();
  }, [userId, authLoading]);

  const handleCreate = () => {
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (formData: {
    strengths: string;
    interests: string;
    personality: string;
    dreamJob: string;
  }) => {
    if (!userId) {
      toast.error("❌ Không tìm thấy userId, vui lòng đăng nhập lại.");
      return;
    }

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
          {/* Nhập thông tin */}
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

          {/* Lịch sử dashboard */}
          <div className="card mb-5">
            <div className="card-body">
              <Typography variant="h6" className="dashboard-history-title">
                Lịch sử Dashboard
              </Typography>
              <div className="neovana-timeline">
                {dashboards.map((d) => {
                  const isSelected = selected?.id === d.id;
                  return (
                    <div key={d.id} className="neovana-timeline-item">
                      <span className="neovana-timeline-dot" />
                      <button
                        type="button"
                        className={`neovana-timeline-btn ${
                          isSelected ? "neovana-timeline-btn--selected" : ""
                        }`}
                        onClick={() => setSelected(d)}
                      >
                        <span className="neovana-timeline-title">
                          {d.title || "Dashboard"}
                        </span>
                        <span className="neovana-timeline-date">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bảng chi tiết bên phải */}
        <div className="col-xxl-8 gy-0 gy-xxl-8">
          {selected ? (
            <Box display="flex" flexDirection="column" gap={2}>
              <SummaryCard dashboard={selected} />
              <CareersCard careers={selected.careers} />
            </Box>
          ) : (
            <Typography>Chưa có dữ liệu.</Typography>
          )}
        </div>
      </div>

      {/* Hàng kỹ năng & chứng chỉ */}
      <div className="row g-0 g-xl-5 g-xxl-8">
        <div className="col-xxl-6 p-5">
          {selected ? (
            <SkillsCard skills={mapSkills(selected.skillsToImprove || [])} />
          ) : (
            <Typography>Chưa có dữ liệu.</Typography>
          )}
        </div>
        <div className="col-xxl-6">
          {selected ? (
            <CertificatesCard certificates={selected.certificatesToAdd || []} />
          ) : (
            <Typography>Chưa có dữ liệu.</Typography>
          )}
        </div>
      </div>

      {/* Hàng môn học */}
      <div className="row g-0 g-xl-5 g-xxl-8">
        {selected ? (
          <SubjectsCard subjects={selected.subjectsToFocus || []} />
        ) : (
          <Typography>Chưa có dữ liệu.</Typography>
        )}
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

// FILE: src/app/pages/neovana/DinhHuongPhatTrienPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

const userId = "user_fake_id_123456";

const DinhHuongPhatTrienPage: React.FC = () => {
  const [dashboards, setDashboards] = useState<CareerDashboard[]>([]);
  const [selected, setSelected] = useState<CareerDashboard | null>(null);
  const [open, setOpen] = useState(false);

  const loadDashboards = async () => {
    const data = await getCareerDashboardsByUser();
    setDashboards(data);
    if (data.length > 0) setSelected(data[0]);
  };

  useEffect(() => {
    loadDashboards();
  }, []);

  const handleCreate = async () => {
    const formData = {
      strengths: "Toán, Lập trình",
      interests: "AI, STEM",
      personality: "Logic, phân tích",
      dreamJob: "Kỹ sư AI",
    };
    const dashboard = await generateCareerDashboard(userId, formData);
    const saved = await addCareerDashboard(dashboard);
    await loadDashboards();
    setSelected(saved);
    setOpen(true);
  };

  const mapSkills = (skills: SkillToImprove[]): Skill[] =>
    skills.map((s) => ({
      name: s.name,
      priority: Number(s.priority),
      priorityRatio: s.priorityRatio,
      reason: s.reason,
    }));

  return (
    <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
      {/* Bên trái */}
      <Box flex={1}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleCreate}
        >
          Tạo Career Dashboard
        </Button>
        <Box mt={2}>
          <Typography variant="h6">Lịch sử Dashboard</Typography>
          {dashboards.map((d) => (
            <Button
              key={d.id}
              fullWidth
              variant={selected?.id === d.id ? "contained" : "outlined"}
              sx={{ mt: 1 }}
              onClick={() => {
                setSelected(d);
                setOpen(true);
              }}
            >
              {d.title || "Dashboard"} (
              {new Date(d.createdAt).toLocaleDateString()})
            </Button>
          ))}
        </Box>
      </Box>

      {/* Dialog hiển thị chi tiết Dashboard */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selected?.title || "Chi tiết Career Dashboard"}
        </DialogTitle>
        <DialogContent dividers>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DinhHuongPhatTrienPage;

// ====================== PhanTichNangLucPage.tsx (FULL — Updated) ======================
import * as React from "react";
import { Container, Typography, Box, Snackbar, Alert } from "@mui/material";

import TabPanel from "./components_phantich/TabPanel";
import TabsContainer from "./components_phantich/TabsContainer";

import SkillEvaluation from "./components_phantich/SkillEvaluation";
import CertificateEvaluation from "./components_phantich/CertificateEvaluation";
import SubjectEvaluation from "./components_phantich/SubjectEvaluation";

import RadarSubjectsChart from "./components_phantich/RadarSubjectsChart";
import RadarSkillsChart from "./components_phantich/RadarSkillsChart";

import {
  addUserSkill,
  addUserCertificate,
} from "../../../services/userSkillCertService";

import { getAllSkills, addSkill } from "../../../services/skillService";

import {
  getAllCertificates,
  addCertificate,
} from "../../../services/certificateService";

import { getCareerDashboardsByUser } from "../../../services/careerDashboardService";
import { CareerDashboard } from "../../../types/CareerDashboard";

import { useFirebaseUser } from "../../hooks/useFirebaseUser";

// -------------------- RADAR TYPE --------------------
type RadarData = { labels: string[]; values: number[] };

// Utility: tạo code chuẩn A2
const generateCode = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

export default function PhanTichNangLucPage() {
  const [dashboard, setDashboard] = React.useState<CareerDashboard | null>(null);
  const [value, setValue] = React.useState(0);

  const [subjectsRadar, setSubjectsRadar] =
    React.useState<RadarData | null>(null);
  const [skillsRadar, setSkillsRadar] = React.useState<RadarData | null>(null);

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { userId } = useFirebaseUser();

  // ================= LOAD DASHBOARD =================
  const loadDashboards = async () => {
    if (!userId) return;

    const list = await getCareerDashboardsByUser(userId);
    if (list.length === 0) return;

    const d = list[0];
    setDashboard(d);

    setSubjectsRadar({
      labels: d.subjectsToFocus?.map((s) => s.name) || [],
      values: d.subjectsToFocus?.map((s) => Number(s.score || 0)) || [],
    });

    setSkillsRadar({
      labels: d.skillsToImprove?.map((s) => s.name) || [],
      values:
        d.skillsToImprove?.map(
          (s) =>
            Number(s.priorityRatio) ||
            Number(s.priority) * 10 ||
            0
        ) || [],
    });
  };

  React.useEffect(() => {
    if (!userId) return;
    loadDashboards();
  }, [userId]);

  const notify = (msg: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message: msg, severity });

  if (!dashboard)
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography>Chưa có dữ liệu Career Dashboard.</Typography>
      </Container>
    );

  // =====================================================================
  // ========================== UI =======================================
  // =====================================================================

  return (
    <Container maxWidth="lg" sx={{ mt: 5, pb: 12 }}>
      <Typography variant="h4" sx={{ mb: 2 }} fontWeight={700}>
        🧭 NEOVANA — Phân tích năng lực cá nhân
      </Typography>

      <TabsContainer value={value} onChange={(e: any, v: number) => setValue(v)} />

      {/* TAB 1 — MÔN HỌC */}
      <TabPanel value={value} index={0}>
        <Box sx={{ bgcolor: "#FFEEDB", p: 2, borderRadius: 3 }}>
          <SubjectEvaluation data={dashboard.subjectsToFocus} />

          {value === 0 && (subjectsRadar?.labels?.length ?? 0) > 0 && (
            <Box sx={{ mt: 2 }}>
              <RadarSubjectsChart key={"subjects" + value} data={subjectsRadar} />
            </Box>
          )}
        </Box>
      </TabPanel>

      {/* TAB 2 — KỸ NĂNG */}
      <TabPanel value={value} index={1}>
        <Box sx={{ bgcolor: "#E4EEFF", p: 2, borderRadius: 3 }}>
          <SkillEvaluation
            data={dashboard.skillsToImprove}
            onAdd={async (i: number) => {
              const sk = dashboard.skillsToImprove[i];

              // 1️⃣ THÊM VÀO DANH MỤC (nếu chưa có)
              const list = await getAllSkills();
              const exists = list.some(
                (x) => x.name.trim().toLowerCase() === sk.name.trim().toLowerCase()
              );
              if (!exists) {
                await addSkill({
                  code: generateCode(sk.name),
                  name: sk.name,
                  description:
                    "Kỹ năng được bổ sung tự động từ phân tích năng lực",
                });
              }

              // 2️⃣ THÊM VÀO HỒ SƠ
              await addUserSkill(userId!, {
                name: sk.name,
                level: 2,
                status: "existing",
              });

              // 3️⃣ UPDATE UI LOCAL
              (dashboard.skillsToImprove[i] as any).status = "existing";
              setDashboard({ ...dashboard });

              notify(`Đã bổ sung kỹ năng "${sk.name}"`, "success");
              loadDashboards();
            }}
            onMarkExisting={async (i: number) => {
              const sk = dashboard.skillsToImprove[i];

              const list = await getAllSkills();
              const exists = list.some(
                (x) => x.name.trim().toLowerCase() === sk.name.trim().toLowerCase()
              );
              if (!exists) {
                await addSkill({
                  name: sk.name,
                  description:
                    "Kỹ năng được đánh dấu đã có từ phân tích năng lực",
                });
              }
              await addUserSkill(userId!, {
                name: sk.name,
                level: 3,
                status: "existing",
              });

              (dashboard.skillsToImprove[i] as any).status = "existing";
              setDashboard({ ...dashboard });

              notify(`"${sk.name}" đã được đánh dấu là đã có`, "success");
              loadDashboards();
            }}
          />

          {value === 1 && (skillsRadar?.labels?.length ?? 0) > 0 && (
            <Box sx={{ mt: 2 }}>
              <RadarSkillsChart key={"skills" + value} data={skillsRadar} />
            </Box>
          )}
        </Box>
      </TabPanel>

      {/* TAB 3 — CHỨNG CHỈ */}
      <TabPanel value={value} index={2}>
        <Box sx={{ bgcolor: "#E8FBD8", p: 2, borderRadius: 3 }}>
          <CertificateEvaluation
            data={dashboard.certificatesToAdd}
            onAdd={async (i: number) => {
              const c = dashboard.certificatesToAdd[i];

              const list = await getAllCertificates();
              const exists = list.some(
                (x) => x.name.trim().toLowerCase() === c.name.trim().toLowerCase()
              );

              if (!exists) {
                await addCertificate({
                  code: generateCode(c.name),
                  name: c.name,
                  description:
                    "Chứng chỉ được bổ sung tự động từ phân tích năng lực",
                });
              }

              await addUserCertificate(userId!, {
                name: c.name,
                status: "existing",
              });

              notify(`Đã bổ sung chứng chỉ "${c.name}"`, "success");
              loadDashboards();
            }}
            onMarkExisting={async (i: number) => {
              const c = dashboard.certificatesToAdd[i];

              const list = await getAllCertificates();
              const exists = list.some(
                (x) => x.name.trim().toLowerCase() === c.name.trim().toLowerCase()
              );

              if (!exists) {
                await addCertificate({
                  code: generateCode(c.name),
                  name: c.name,
                  description:
                    "Chứng chỉ được đánh dấu đã có từ phân tích năng lực",
                });
              }
              await addUserCertificate(userId!, {
                name: c.name,
                status: "existing",
              });

              notify(`"${c.name}" đã có`, "success");
              loadDashboards();
            }}
          />
        </Box>
      </TabPanel>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

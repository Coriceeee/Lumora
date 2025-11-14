// src/app/pages/neovana/PhanTichNangLucPage.tsx
import * as React from "react";
import { Container, Typography, Box, Snackbar, Alert } from "@mui/material";
import { getAuth } from "firebase/auth";

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

import { getCareerDashboardsByUser } from "../../../services/careerDashboardService";
import { CareerDashboard, SubjectToFocus, SkillToImprove } from "../../../types/CareerDashboard";
import { useFirebaseUser } from "../../hooks/useFirebaseUser";

// -------------------- RADAR TYPE --------------------
type RadarData = {
  labels: string[];
  values: number[];
};

export default function PhanTichNangLucPage() {
  const auth = getAuth();

  const [dashboard, setDashboard] = React.useState<CareerDashboard | null>(null);

  const [value, setValue] = React.useState(0);

  const [subjectsRadar, setSubjectsRadar] = React.useState<RadarData | null>(null);
  const [skillsRadar, setSkillsRadar] = React.useState<RadarData | null>(null);

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
    // 🔥 Hook lấy userId
    const { userId } = useFirebaseUser();
  

  
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
    values: d.skillsToImprove?.map(
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



  // -------------------- SNACKBAR --------------------
  const notify = (msg: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message: msg, severity });
  };

  // -------------------- UI --------------------
  if (!dashboard)
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography>Chưa có dữ liệu Career Dashboard.</Typography>
      </Container>
    );

  return (dashboard && (
    <Container maxWidth="lg" sx={{ mt: 5, pb: 12 }}>
      <Typography variant="h4" sx={{ mb: 3 }} fontWeight={700}>
        🧭 NEOVANA — Phân tích năng lực
      </Typography>

      <TabsContainer value={value} onChange={(e: any, v: number) => setValue(v)} />

      {/* TAB 1: MÔN HỌC */}
      <TabPanel value={value} index={0}>
        <Box sx={{ bgcolor: "#FFEEDB", p: 2, borderRadius: 3 }}>
          <SubjectEvaluation data={dashboard.subjectsToFocus} />

          <Box sx={{ mt: 2 }}>
            <RadarSubjectsChart data={subjectsRadar} />
          </Box>
        </Box>
      </TabPanel>

      {/* TAB 2: KỸ NĂNG */}
      <TabPanel value={value} index={1}>
        <Box sx={{ bgcolor: "#E4EEFF", p: 2, borderRadius: 3 }}>
          <SkillEvaluation
            data={dashboard.skillsToImprove}
            onAdd={async (i: number) => {
              const sk = dashboard.skillsToImprove[i];
              await addUserSkill(userId || "", {
                name: sk.name,
                level: 2,
                status: "existing",
              });
              notify(`Đã thêm kỹ năng "${sk.name}"`, "success");
            }}
            onMarkExisting={async (i: number) => {
              const sk = dashboard.skillsToImprove[i];
              await addUserSkill(userId || "", {
                name: sk.name,
                level: 3,
                status: "existing",
              });
              notify(`"${sk.name}" đã có`, "success");
            }}
          />

          <Box sx={{ mt: 2 }}>
            <RadarSkillsChart data={skillsRadar} />
          </Box>
        </Box>
      </TabPanel>

      {/* TAB 3: CHỨNG CHỈ */}
      <TabPanel value={value} index={2}>
        <Box sx={{ bgcolor: "#E8FBD8", p: 2, borderRadius: 3 }}>
          <CertificateEvaluation
            data={dashboard.certificatesToAdd}
            onAdd={async (i: number) => {
              const c = dashboard.certificatesToAdd[i];
              await addUserCertificate(userId || "", {
                name: c.name,
                status: "existing",
              });
              notify(`Đã bổ sung chứng chỉ "${c.name}"`, "success");
            }}
            onMarkExisting={async (i: number) => {
              const c = dashboard.certificatesToAdd[i];
              await addUserCertificate(userId || "", {
                name: c.name,
                status: "existing",
              });
              notify(`"${c.name}" đã có`, "success");
            }}
          />
        </Box>
      </TabPanel>

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
  ));
}

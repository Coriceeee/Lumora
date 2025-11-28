// ====================== PhanTichNangLucPage.tsx (FINAL + MATCH C2) ======================
import * as React from "react";
import { Container, Typography, Box, Snackbar, Alert } from "@mui/material";

import TabPanel from "./components_phantich/TabPanel";
import TabsContainer from "./components_phantich/TabsContainer";

import SkillEvaluation from "./components_phantich/SkillEvaluation";
import CertificateEvaluation from "./components_phantich/CertificateEvaluation";
import SubjectEvaluation from "./components_phantich/SubjectEvaluation";

import RadarSubjectsChart from "./components_phantich/RadarSubjectsChart";
import RadarSkillsChart from "./components_phantich/RadarSkillsChart";
// Nếu bạn muốn radar chứng chỉ thì chỉ cần mở import này:
// import RadarCerti from "./components_phantich/RadarCertiChart";

import {
  getAllSkills,
  addSkill,
} from "../../../services/skillService";
import {
  getAllCertificates,
  addCertificate,
} from "../../../services/certificateService";

import { getUserSkills } from "../../../services/userSkillService";
import { getUserCertificates } from "../../../services/userCertificateService";

import { getCareerDashboardsByUser } from "../../../services/careerDashboardService";
import { CareerDashboard } from "../../../types/CareerDashboard";

import { addDoc, collection } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

// ⭐ Engine Match C2
import { calculateCareerMatch_C2 } from "./utils/CareerMatchEngine";

import { useFirebaseUser } from "../../hooks/useFirebaseUser";

type RadarData = { labels: string[]; values: number[] };

const generateCode = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

export default function PhanTichNangLucPage() {
  const { userId } = useFirebaseUser();

  const [dashboard, setDashboard] = React.useState<CareerDashboard | null>(null);
  const [value, setValue] = React.useState(0);

  const [subjectsRadar, setSubjectsRadar] = React.useState<RadarData | null>(
    null
  );
  const [skillsRadar, setSkillsRadar] = React.useState<RadarData | null>(null);
  const [certRadar, setCertRadar] = React.useState<RadarData | null>(null);

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const notify = (msg: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message: msg, severity });

  // ======================================================================
  //                        LOAD DASHBOARD + MATCH C2
  // ======================================================================
  const loadDashboards = async () => {
    if (!userId) return;

    const list = await getCareerDashboardsByUser(userId);
    if (!list || list.length === 0) return;

    // ⭐ luôn lấy dashboard mới nhất
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const d = sorted[0];

    // Load profile data thật
    const userSkills = await getUserSkills(userId);
    const userCerts = await getUserCertificates(userId);
    const skillDefs = await getAllSkills();
    const certDefs = await getAllCertificates();

    const userSkillNames = userSkills.map((s: any) => {
      const def = skillDefs.find((d: any) => d.id === s.skillId);
      return def ? def.name.toLowerCase().trim() : "";
    });
    const userCertNames = userCerts.map((c: any) => {
      const def = certDefs.find((d: any) => d.id === c.certificateId);
      return def ? def.name.toLowerCase().trim() : "";
    });

    // Auto-sync kỹ năng
    d.skillsToImprove =
      d.skillsToImprove?.map((s: any) => ({
        ...s,
        status: userSkillNames.includes(s.name.toLowerCase().trim())
          ? "existing"
          : "need",
      })) || [];

    // Auto-sync chứng chỉ
    d.certificatesToAdd =
      d.certificatesToAdd?.map((c: any) => ({
        ...c,
        status: userCertNames.includes(c.name.toLowerCase().trim())
          ? "existing"
          : "need",
      })) || [];

    // ========================= RADAR DATA =========================
    setSubjectsRadar({
      labels: d.subjectsToFocus?.map((s) => s.name) || [],
      values: d.subjectsToFocus?.map((s) => Number(s.score || 0)) || [],
    });

    setSkillsRadar({
      labels: d.skillsToImprove?.map((s) => s.name) || [],
      values:
        d.skillsToImprove?.map(
          (s: any) =>
            Number(s.priorityRatio) * 100 || Number(s.priority) * 10 || 0
        ) || [],
    });

    // Nếu bạn muốn radar chứng chỉ thì uncomment:
    setCertRadar({
      labels: d.certificatesToAdd?.map((c) => c.name) || [],
      values:
        d.certificatesToAdd?.map(
          (c: any) =>
            Number(c.priorityRatio) * 100 || Number(c.priority) * 10 || 0
        ) || [],
    });

    // ========================= MATCH C2 =========================
    if (d.careers && d.careers.length > 0) {
      d.careers = calculateCareerMatch_C2(
        d.careers,
        d.subjectsToFocus || [],
        d.skillsToImprove || [],
        d.certificatesToAdd || []
      );
    }

    setDashboard({ ...d });
  };

  React.useEffect(() => {
    if (userId) loadDashboards();
  }, [userId]);

  if (!dashboard)
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography>Chưa có dữ liệu.</Typography>
      </Container>
    );

  // ======================================================================
  //                                UI
  // ======================================================================
  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" sx={{ mb: 2 }} fontWeight={700}>
        🧭 NEOVANA — Phân tích năng lực cá nhân
      </Typography>

      <TabsContainer
        value={value}
        onChange={(e: React.SyntheticEvent, v: number) => setValue(v)}
      />

      {/* ====================== TAB 1 — MÔN HỌC ====================== */}
      <TabPanel value={value} index={0}>
        <Box sx={{ bgcolor: "#FFEEDB", p: 2, borderRadius: 3 }}>
          <SubjectEvaluation data={dashboard.subjectsToFocus} />

          {subjectsRadar && (
            <Box sx={{ mt: 2 }}>
              <RadarSubjectsChart data={subjectsRadar} />
            </Box>
          )}
        </Box>
      </TabPanel>

      {/* ====================== TAB 2 — KỸ NĂNG ====================== */}
      <TabPanel value={value} index={1}>
        <Box sx={{ bgcolor: "#E4EEFF", p: 2, borderRadius: 3 }}>
          <SkillEvaluation
            data={dashboard.skillsToImprove}
            onAdd={async (i: number) => {
              if (!userId) return;

              const sk = dashboard.skillsToImprove[i];

              let list = await getAllSkills();
              let existing = list.find(
                (x) =>
                  x.name.trim().toLowerCase() ===
                  sk.name.trim().toLowerCase()
              );

              if (!existing) {
                const newId = generateCode(sk.name);
                await addSkill({
                  id: newId,
                  code: newId,
                  name: sk.name,
                  description: "Tự động thêm từ phân tích",
                });
                existing = { id: newId, name: sk.name };
              }

              await addDoc(collection(db, "userSkills"), {
                userId,
                skillId: existing!.id,
                level: 4,
                date: Date.now(),
                description: "Thêm từ phân tích",
              });

              notify(`Đã thêm kỹ năng "${sk.name}"`, "success");
              loadDashboards();
            }}
          />

          {skillsRadar && (
            <Box sx={{ mt: 2 }}>
              <RadarSkillsChart data={skillsRadar} />
            </Box>
          )}
        </Box>
      </TabPanel>

      {/* ====================== TAB 3 — CHỨNG CHỈ ====================== */}
      <TabPanel value={value} index={2}>
        <Box sx={{ bgcolor: "#E8FBD8", p: 2, borderRadius: 3 }}>
          <CertificateEvaluation
            data={dashboard.certificatesToAdd}
            onAdd={async (i: number) => {
              if (!userId) return;

              const c = dashboard.certificatesToAdd[i];

              let list = await getAllCertificates();
              let existing = list.find(
                (x) =>
                  x.name.trim().toLowerCase() ===
                  c.name.trim().toLowerCase()
              );

              if (!existing) {
                const newId = generateCode(c.name);
                await addCertificate({
                  id: newId,
                  code: newId,
                  name: c.name,
                  description: "Tự động thêm từ phân tích",
                });
                existing = { id: newId, name: c.name };
              }

              await addDoc(collection(db, "userCertificates"), {
                userId,
                certificateId: existing!.id,
                date: Date.now(),
                issuer: "",
                result: "",
                description: "Thêm từ phân tích",
              });

              notify(`Đã thêm chứng chỉ "${c.name}"`, "success");
              loadDashboards();
            }}
          />

          {/* Nếu bạn muốn hiển thị radar chứng chỉ: */}
          {/* {certRadar && (
            <Box sx={{ mt: 2 }}>
              <RadarCerti data={certRadar} title="Biểu đồ Chứng Chỉ" />
            </Box>
          )} */}
        </Box>
      </TabPanel>

      {/* ====================== SNACKBAR ====================== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

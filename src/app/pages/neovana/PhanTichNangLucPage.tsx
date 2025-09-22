// src/app/pages/neovana/PhanTichNangLucPage.tsx
// ===========================================
import * as React from "react";
import {
  Container, Typography, Card, CardHeader, CardContent,
  Stack, Chip, Box, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import SkillRadarChart, { SkillDatum } from "./components/SkillRadarChart";
import CertificatesPanel from "./components/CertificatesPanel";
import CertificateSuggestions, { CertLevel, CertificateItem } from "./components/CertificateSuggestions";

import type { LearningResult } from "../../../types/LearningResult";
import type { UserSkill } from "../../../types/UserSkill";
import type { UserCertificate } from "../../../types/UserCertificate";
import type { Skill } from "../../../types/Skill";
import type { Certificate } from "../../../types/Certificate";
import type { Subject } from "../../../types/Subject";
import type { TargetProfile, TargetSkill } from "../../../types/TargetProfile";

import { getLearningResultsByUser } from "../../../services/learningResultService";
import { getUserSkills } from "../../../services/userSkillService";
import { getUserCertificates } from "../../../services/userCertificateService";
import { getAllSkills } from "../../../services/skillService";
import { getAllCertificates } from "../../../services/certificateService";
import { getAllSubjects } from "../../../services/subjectService";

import {
  aggregateSubjects,
  buildRadarData,
  buildCertificateSuggestions,
} from "./utils/aggregate";
import type { SubjectStat, RadarDatum } from "./utils/aggregate";

import {
  getTargetProfilesByUser,
  getDefaultTargetProfile
} from "../../../services/targetProfileService";

const USER_ID = "user_fake_id_123456";

export default function PhanTichNangLucPage() {
  const [learning, setLearning] = React.useState<LearningResult[]>([]);
  const [skills, setSkills] = React.useState<UserSkill[]>([]);
  const [certs, setCerts] = React.useState<UserCertificate[]>([]);
  const [skillCatalog, setSkillCatalog] = React.useState<Skill[]>([]);
  const [certCatalog, setCertCatalog] = React.useState<Certificate[]>([]);
  const [subjectCatalog, setSubjectCatalog] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Hồ sơ mục tiêu từ Firestore
  const [profiles, setProfiles] = React.useState<TargetProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = React.useState<string>("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [
          lr, sk, ct, sc, cc, subj,
          userProfiles, defaultProfile
        ] = await Promise.all([
          getLearningResultsByUser(USER_ID),
          getUserSkills(USER_ID),
          getUserCertificates(USER_ID),
          getAllSkills(),
          getAllCertificates(),
          getAllSubjects(),
          getTargetProfilesByUser(USER_ID, /* includeGlobal */ true),
          getDefaultTargetProfile(USER_ID),
        ]);

        if (!mounted) return;

        setLearning(lr || []);
        setSkills(sk || []);
        setCerts(ct || []);
        setSkillCatalog(sc || []);
        setCertCatalog(cc || []);
        setSubjectCatalog(subj || []);
        setProfiles(userProfiles || []);

        if (defaultProfile) setActiveProfileId(defaultProfile.id);
        else if (userProfiles && userProfiles.length > 0) setActiveProfileId(userProfiles[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Map id -> entity
  const skillCatalogMap = React.useMemo<Record<string, Skill>>(
    () => Object.fromEntries((skillCatalog || []).map(s => [s.id!, s])),
    [skillCatalog]
  );
  const certCatalogMap = React.useMemo<Record<string, Certificate>>(
    () => Object.fromEntries((certCatalog || []).map(c => [c.id!, c])),
    [certCatalog]
  );
  const subjectCatalogMap = React.useMemo<Record<string, Subject>>(
    () => Object.fromEntries((subjectCatalog || []).map(s => [s.id!, s])),
    [subjectCatalog]
  );

  // Tổng hợp theo môn (0–100)
  const subjects: SubjectStat[] = React.useMemo(
    () => aggregateSubjects(learning, subjectCatalogMap),
    [learning, subjectCatalogMap]
  );

  // Radar hiện tại
  const radar: RadarDatum[] = React.useMemo(
    () => buildRadarData(subjects, skills, 4, 3, skillCatalogMap),
    [subjects, skills, skillCatalogMap]
  );

  // convert cho chart
  const currentSkillData: SkillDatum[] = React.useMemo(
    () => radar.map(r => ({ name: r.name, score: r.score })),
    [radar]
  );

  // Hồ sơ mục tiêu đang chọn
  const activeProfile = React.useMemo(
    () => profiles.find(p => p.id === activeProfileId) || null,
    [profiles, activeProfileId]
  );

  const targetProfileData: SkillDatum[] = React.useMemo(() => {
    if (!activeProfile) return [];
    // gắn kiểu rõ ràng để tránh TS7006
    return (activeProfile.skills || []).map((s: TargetSkill) => ({
      name: s.name,
      score: s.score,
    }));
  }, [activeProfile]);

  // Gợi ý chứng chỉ (có thể thiếu field level trong aggregate → map thêm mặc định)
  const rawSuggestions = React.useMemo(
    () => buildCertificateSuggestions(subjects, skills, certs, certCatalogMap),
    [subjects, skills, certs, certCatalogMap]
  );

  const suggestions: CertificateItem[] = React.useMemo(
    () =>
      rawSuggestions.map((i: any) => ({
        id: i.id,
        name: i.name,
        provider: i.provider,
        level: (i.level as CertLevel) ?? "Trung cấp", // <-- bổ sung level mặc định để khớp type
        estHours: i.estHours,
        rationale: i.rationale,
        tags: i.tags,
        url: i.url,
      })),
    [rawSuggestions]
  );

  const topSubjects = subjects.slice(0, 6);
  const weakSubjects = subjects.filter(s => s.avg < 60).slice(0, 6);

  // Handler
  const handleChangeProfile = (id: string) => setActiveProfileId(id);
  const handleEnroll = (id: string) => console.log("Enroll cert:", id);
  const handleSavePlan = (ids: string[]) => console.log("Save learning plan:", ids);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        🧭 NEOVANA – Phân tích năng lực & khoảng trống mục tiêu
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4 }}>
        Gương soi năng lực hiện tại · So khớp hồ sơ mục tiêu (Firestore) · Đề xuất chứng chỉ để bồi đắp khoảng trống.
      </Typography>

      {loading ? (
        <Typography variant="body2">Đang tải dữ liệu…</Typography>
      ) : (
        <>
          {/* Radar + chọn hồ sơ mục tiêu từ Firestore */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            <div style={{ flex: "1 1 55%" }}>
              <SkillRadarChart
                title="Biểu đồ năng lực tổng hợp"
                subtitle="So sánh Hiện tại vs Hồ sơ mục tiêu"
                data={currentSkillData}
                benchmark={targetProfileData}
                benchmarkLabel={activeProfile?.label || "Mục tiêu"}
              />
            </div>
            <div style={{ flex: "1 1 40%" }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardHeader title="Hồ sơ mục tiêu" subheader="Chọn từ Firestore" />
                <CardContent>
                  <FormControl fullWidth size="small">
                    <InputLabel>Hồ sơ</InputLabel>
                    <Select
                      value={activeProfileId}
                      label="Hồ sơ"
                      onChange={(e)=>handleChangeProfile(e.target.value)}
                      displayEmpty
                    >
                      {profiles.length === 0 && (
                        <MenuItem value="" disabled>Chưa có hồ sơ mục tiêu</MenuItem>
                      )}
                      {profiles.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.label} {p.isGlobal ? "— (Global)" : ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {activeProfile?.description && (
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                      {activeProfile.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Chỉ dấu học lực tổng hợp (định hướng dài hạn, không theo dõi ngày/tuần) */}
          <div style={{ marginTop: 24 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader title="Chỉ dấu học lực tổng hợp" subheader="Điểm trung bình theo môn (chuẩn hóa 0–100)" />
              <CardContent>
                {topSubjects.length === 0 ? (
                  <Typography variant="body2">Chưa có dữ liệu.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {topSubjects.map(s => (
                      <Stack key={s.subjectId} direction="row" alignItems="center" spacing={1}>
                        <Typography sx={{ minWidth: 180 }}>{s.subjectName}</Typography>
                        <Chip label={`${s.avg}/100`} color={s.avg >= 75 ? "success" : s.avg >= 60 ? "warning" : "default"} />
                      </Stack>
                    ))}
                  </Stack>
                )}
                {weakSubjects.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Typography variant="subtitle2" gutterBottom>Khoảng trống ưu tiên theo môn</Typography>
                    <Stack spacing={1}>
                      {weakSubjects.map(s => (
                        <Stack key={`weak-${s.subjectId}`} direction="row" alignItems="center" spacing={1}>
                          <Typography sx={{ minWidth: 180 }}>{s.subjectName}</Typography>
                          <Chip label={`${s.avg}/100`} color="default" />
                        </Stack>
                      ))}
                    </Stack>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chứng chỉ */}
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 24 }}>
            <div style={{ flex: "1 1 55%" }}>
              <CertificatesPanel items={certs} certCatalogMap={certCatalogMap} />
            </div>
            <div style={{ flex: "1 1 40%" }}>
              <CertificateSuggestions
                items={suggestions}
                onEnroll={handleEnroll}
                onSavePlan={handleSavePlan}
              />
            </div>
          </div>
        </>
      )}
    </Container>
  );
}

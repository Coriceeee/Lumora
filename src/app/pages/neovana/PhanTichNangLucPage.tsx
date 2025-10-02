import * as React from "react";
import { Container, Typography, Box, Button, Card, CardContent } from "@mui/material";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { generateGeminiPrompt } from "./utils/generateGeminiPrompt";
import { callGeminiForDashboard } from "../../../services/geminiDashboardService";
import { getLearningResultsByUser } from "../../../services/learningResultService";
import { getUserSkills } from "../../../services/userSkillService";
import { getUserCertificates } from "../../../services/userCertificateService";
import { getAllSkills } from "../../../services/skillService";
import { getAllCertificates } from "../../../services/certificateService";
import { getAllSubjects } from "../../../services/subjectService";
import { getCareersInLatestDashboard } from "../../../services/targetProfileService";

import SkillEvaluation from "./components_phantich/SkillEvaluation";
import CertificateEvaluation from "./components_phantich/CertificateEvaluation";
import SubjectEvaluation from "./components_phantich/SubjectEvaluation";

const USER_ID = "user_fake_id_123456";

export default function PhanTichNangLucPage() {
  const [learning, setLearning] = React.useState<any[]>([]);
  const [skills, setSkills] = React.useState<any[]>([]);
  const [certs, setCerts] = React.useState<any[]>([]);
  const [selectedCareer, setSelectedCareer] = React.useState<string | null>(null);
  const [geminiResults, setGeminiResults] = React.useState<any | null>(null);
  const [radarData, setRadarData] = React.useState<{ subjects: any[], skillsCerts: any[] }>({ subjects: [], skillsCerts: [] });
  const [loading, setLoading] = React.useState(true);

  // Chuyển đổi radarData từ Gemini sang 2 radar riêng
  const transformRadarDataSeparate = (rawData: any) => {
    if (!rawData?.labels || !rawData?.series) return { subjects: [], skillsCerts: [] };
    const subjectNames = rawData.labels.map((label: string) => label.split(":")[1]);

    // Radar Môn học (thang 10)
    const subjects = subjectNames.map((name: string, idx: number) => {
      const obj: any = { subjectName: name };
      const monHocSeries = rawData.series.find((s: any) => s.name === "Môn học");
      obj["Môn học"] = monHocSeries?.data[idx] ? +(monHocSeries.data[idx] / 10).toFixed(1) : 0;
      return obj;
    });

    // Radar Kỹ năng & Chứng chỉ (thang 0–100)
    const skillsCerts = subjectNames.map((name: string, idx: number) => {
      const obj: any = { subjectName: name };
      const kyNangSeries = rawData.series.find((s: any) => s.name === "Kỹ năng");
      const chungChiSeries = rawData.series.find((s: any) => s.name === "Chứng chỉ");
      obj["Kỹ năng"] = kyNangSeries?.data[idx] || 0;
      obj["Chứng chỉ"] = chungChiSeries?.data[idx] || 0;
      return obj;
    });

    return { subjects, skillsCerts };
  };

  // Nút bổ sung trực tiếp cho Kỹ năng
  const handleAddSkill = (index: number) => {
    const newSkills = [...geminiResults.skillsEvaluation];
    newSkills[index].status = 'existing';
    setGeminiResults({ ...geminiResults, skillsEvaluation: newSkills });
  };

  // Nút bổ sung trực tiếp cho Chứng chỉ
  const handleAddCert = (index: number) => {
    const newCerts = [...geminiResults.certificatesEvaluation];
    newCerts[index].status = 'existing';
    setGeminiResults({ ...geminiResults, certificatesEvaluation: newCerts });
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [lr, sk, ct, sc, cc, subj, userProfiles] = await Promise.all([
          getLearningResultsByUser(USER_ID),
          getUserSkills(USER_ID),
          getUserCertificates(USER_ID),
          getAllSkills(),
          getAllCertificates(),
          getAllSubjects(),
          getCareersInLatestDashboard(USER_ID)
        ]);

        if (!mounted) return;

        // Chuyển đổi điểm Môn học về thang 10
        setLearning(lr?.map((subject: any) => ({
          ...subject,
          avgScore: +(subject.avgScore / 10).toFixed(1)
        })) || []);

        setSkills(sk || []);
        setCerts(ct || []);

        if (userProfiles.length > 0) {
          setSelectedCareer(userProfiles[0] || null);
        }

        const geminiPrompt = generateGeminiPrompt({
          skills: sk,
          certs: ct,
          subjects: lr,
          selectedCareers: userProfiles
        });

        const responseText = await callGeminiForDashboard(geminiPrompt);
        const cleanedText = responseText.replace(/```json|```/g, "").trim();
        const response = JSON.parse(cleanedText);
        setGeminiResults(response);
        setRadarData(transformRadarDataSeparate(response?.radarData));
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <Typography variant="body2">Đang tải dữ liệu...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700} color="#1a237e">
        🧭 NEOVANA – Phân tích năng lực & khoảng trống mục tiêu
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: '#555' }}>
        Gương soi năng lực hiện tại · So khớp hồ sơ mục tiêu · Đề xuất chứng chỉ để bồi đắp khoảng trống.
      </Typography>

      {/* Evaluation Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 4 }}>
        {/* Kỹ năng */}
        <Card sx={{ flex: '1 1 calc(50% - 16px)', minWidth: 280, boxShadow: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom color="#3f51b5">Đánh giá Kỹ năng</Typography>
            <SkillEvaluation data={geminiResults?.skillsEvaluation} />
            {geminiResults?.skillsEvaluation?.map((item: any, idx: number) => (
              item.status === 'need' &&
              <Button key={idx} size="small" variant="outlined" color="primary" sx={{ mt: 1 }} onClick={() => handleAddSkill(idx)}>
                Bổ sung trực tiếp
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Chứng chỉ */}
        <Card sx={{ flex: '1 1 calc(50% - 16px)', minWidth: 280, boxShadow: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom color="#4caf50">Đánh giá Chứng chỉ</Typography>
            <CertificateEvaluation data={geminiResults?.certificatesEvaluation} />
            {geminiResults?.certificatesEvaluation?.map((item: any, idx: number) => (
              (item.status === 'need' || item.status === 'notHave') &&
              <Button key={idx} size="small" variant="outlined" color={item.status==='need' ? 'primary':'success'} sx={{ mt: 1 }} onClick={() => handleAddCert(idx)}>
                {item.status==='need' ? 'Bổ sung trực tiếp' : 'Đã có'}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Môn học */}
        <Card sx={{ flex: '1 1 100%', minWidth: 280, boxShadow: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom color="#ff9800">Đánh giá Môn học</Typography>
            <SubjectEvaluation data={learning} /> {/* Thang điểm 0–10 */}
          </CardContent>
        </Card>
      </Box>

      {/* Radar Chart 2 cột song song */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 5 }}>
        {/* Radar Môn học */}
        <Box sx={{ flex: '1 1 48%', minWidth: 300, py: 3, bgcolor: '#f5f5f5', borderRadius: 3 }}>
          <Typography variant="h6" color="#1a237e" gutterBottom>Radar Môn học</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData.subjects}>
              <PolarGrid stroke="#e0e0e0" strokeDasharray="4 2" />
              <PolarAngleAxis dataKey="subjectName" tick={{ fontSize: 14, fontWeight: 600, fill: '#333' }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 12, fill: '#666' }} />
              <Radar name="Môn học" dataKey="Môn học" stroke="#ff9800" fill="#ff9800" fillOpacity={0.6} animationDuration={1500} animationEasing="ease-out"/>
              <Legend verticalAlign="top" iconType="circle" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px' }}
                       formatter={(value: any, name: string) => [`${value} / 10`, name]} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>

        {/* Radar Kỹ năng & Chứng chỉ */}
        <Box sx={{ flex: '1 1 48%', minWidth: 300, py: 3, bgcolor: '#f5f5f5', borderRadius: 3 }}>
          <Typography variant="h6" color="#1a237e" gutterBottom>Radar Kỹ năng & Chứng chỉ</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData.skillsCerts}>
              <PolarGrid stroke="#e0e0e0" strokeDasharray="4 2" />
              <PolarAngleAxis dataKey="subjectName" tick={{ fontSize: 14, fontWeight: 600, fill: '#333' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 12, fill: '#666' }} />
              <Radar name="Kỹ năng" dataKey="Kỹ năng" stroke="#3f51b5" fill="#3f51b5" fillOpacity={0.6} animationDuration={1500} animationEasing="ease-out"/>
              <Radar name="Chứng chỉ" dataKey="Chứng chỉ" stroke="#4caf50" fill="#4caf50" fillOpacity={0.6} animationDuration={1500} animationEasing="ease-out"/>
              <Legend verticalAlign="top" iconType="circle" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px' }}
                       formatter={(value: any, name: string) => [`${value} / 100`, name]} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Explore Button */}
      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Button variant="contained" color="primary" sx={{ width: '200px', fontWeight: 'bold', fontSize: 16 }}>
          Explore More
        </Button>
      </Box>
    </Container>
  );
}

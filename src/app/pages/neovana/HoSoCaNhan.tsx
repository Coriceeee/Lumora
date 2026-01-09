// HoSoCaNhan.tsx — FINAL VERSION (AUTO-SYNC NAME-BASED + ORIGINAL UI PRESERVED)

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Plus, X, Award, Star } from "lucide-react";

import { UserSkill } from "../../../types/UserSkill";
import { UserCertificate } from "../../../types/UserCertificate";

import { UserCertificateForm } from "./UserCertificateForm";
import { UserSkillForm } from "./UserSkillForm";

import { useFirebaseUser } from "../../hooks/useFirebaseUser";
import { getUserSkills } from "../../../services/userSkillService";
import { getUserCertificates } from "../../../services/userCertificateService";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

/* ================= Animations ================= */
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const glowingBorder = keyframes`
  0% { border-image-source: linear-gradient(270deg,#a855f7,#ec4899,#a855f7,#ec4899); }
  50% { border-image-source: linear-gradient(90deg,#ec4899,#a855f7,#ec4899,#a855f7); }
  100% { border-image-source: linear-gradient(270deg,#a855f7,#ec4899,#a855f7,#ec4899); }
`;

/* ================= Styled Components ================= */

const Container = styled.div`
  max-width: 1080px;
  margin: 40px auto 80px;
  padding: 0 24px;
  background: linear-gradient(135deg,#f0e6ff,#ffe6f0);
  font-family: "Segoe UI";
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 3.6rem;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 900;
  color: #7e22ce;
  text-shadow: 0 0 12px #a855f7;
`;

const BtnGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 28px;
  margin-bottom: 5rem;
  flex-wrap: wrap;
`;

interface BtnProps { close?: boolean; }

const Btn = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "close"
})<BtnProps>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 36px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  user-select: none;

  border: 2px solid transparent;
  color: ${(p) => (p.close ? "#7c2d12" : "#ffffff")};

  background: ${(p) =>
    p.close
      ? "linear-gradient(135deg, #fde68a, #fecaca)"
      : "linear-gradient(135deg, #7c3aed, #ec4899)"};

  box-shadow: ${(p) =>
    p.close
      ? "0 6px 20px rgba(251, 191, 36, 0.35)"
      : "0 10px 30px rgba(124, 58, 237, 0.45)"};

  transition: 
    transform 0.25s ease,
    box-shadow 0.25s ease,
    filter 0.25s ease;

  &:hover {
    transform: translateY(-2px) scale(1.03);
    filter: brightness(1.05);
    box-shadow: ${(p) =>
      p.close
        ? "0 10px 28px rgba(251, 191, 36, 0.45)"
        : "0 16px 45px rgba(236, 72, 153, 0.55)"};
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 6px 18px rgba(0,0,0,0.2);
  }

  svg {
    stroke-width: 2.4;
  }
`;


const FormWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "purple"
})<{purple?:boolean}>`
  max-width:780px;
  margin:0 auto 5rem;
  padding:40px 48px;
  border-radius:40px;
  background:white;
  border:5px solid transparent;
  animation:${glowingBorder} 8s ease infinite;
  border-image-slice:1;
  border-image-source:linear-gradient(270deg,#a855f7,#ec4899,#a855f7,#ec4899);
  box-shadow:0 10px 40px rgba(158, 81, 255, 0.3);
`;

const Grid2Col = styled.div`
  margin-top:40px;
  display:grid;
  grid-template-columns:1fr;
  gap:32px;
`;

const Card = styled.section`
  background:white;
  border-radius:40px;
  padding:40px 48px;
  box-shadow:0 18px 50px rgba(124,58,237,0.15);
  transition:0.2s;

  &:hover {
    transform:translateY(-3px);
    box-shadow:0 24px 70px rgba(219,39,119,0.3);
  }
`;

const SectionHeader = styled.header`
  display:flex;
  align-items:center;
  gap:20px;
  margin-bottom:32px;

  h2 {
    font-size:2.5rem;
    font-weight:900;
    background:linear-gradient(90deg,#a855f7,#ec4899);
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
  }
`;

const IconPurple = styled(Star)`stroke:#7e22ce;`;
const IconPink = styled(Award)`stroke:#be185d;`;

const Table = styled.table`
  width:100%;
  border-spacing:0;
  border-radius:12px;
  overflow:hidden;
  font-size:1.15rem;
  color:#444;

  thead tr {
    background:linear-gradient(90deg,#a855f7,#ec4899);
    color:white;
  }

  thead th { padding:16px 24px; font-weight:700; }
  tbody tr:nth-child(even){ background:#faf5ff; }
  tbody tr:nth-child(odd){ background:#fff0f6; }

  tbody tr:hover {
    background:linear-gradient(90deg,#ec4899,#a855f7);
    color:white;
  }

  td { padding:16px 24px; }
`;

const TextMuted = styled.p`
  padding:24px;
  text-align:center;
  color:#666;
  font-style:italic;
`;

/* ================= COMPONENT ================= */

export default function HoSoCaNhan() {
  const { userId } = useFirebaseUser();
  
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);

  const [skillDefs, setSkillDefs] = useState<any[]>([]);
  const [certDefs, setCertDefs] = useState<any[]>([]);

  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [loading, setLoading] = useState(true);

  /* Load dữ liệu */
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      // Load hồ sơ kỹ năng
      const userSkills = await getUserSkills(userId);
      setSkills(userSkills);

      // Load hồ sơ chứng chỉ
      const userCerts = await getUserCertificates(userId);
      setCertificates(userCerts);

      // ⭐ Load danh sách skill để đổi ID -> tên
      const skillSnap = await getDocs(collection(db, "skills"));
      setSkillDefs(skillSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // ⭐ Load danh sách certificate để đổi ID -> tên
      const certSnap = await getDocs(collection(db, "certificates"));
      setCertDefs(certSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  /* ID → Name */
  const getSkillName = (id: string) =>
    skillDefs.find(s => s.id === id)?.name || id;

  const getCertificateName = (id: string) =>
    certDefs.find(c => c.id === id)?.name || id;

  return (
    <Container>
      <Title>Hồ sơ năng lực</Title>

      {/* BUTTON GROUP */}
      <BtnGroup>
        <Btn close={showSkillForm} onClick={() => setShowSkillForm(!showSkillForm)}>
          {showSkillForm ? <X size={20} /> : <Plus size={20} />}
          {showSkillForm ? "Đóng Kỹ năng" : "Thêm Kỹ năng"}
        </Btn>

        <Btn close={showCertForm} onClick={() => setShowCertForm(!showCertForm)}>
          {showCertForm ? <X size={20}/> : <Plus size={20}/>}
          {showCertForm ? "Đóng Chứng chỉ" : "Thêm Chứng chỉ"}
        </Btn>
      </BtnGroup>

      {/* FORMS */}
      {showSkillForm && (
        <FormWrapper purple>
          <UserSkillForm userId={userId || ""} onSaved={() => {}} />
        </FormWrapper>
      )}

      {showCertForm && (
        <FormWrapper>
          <UserCertificateForm userId={userId || ""} onSaved={() => {}} />
        </FormWrapper>
      )}

      {/* LIST */}
      <Grid2Col>

        {/* ===== KỸ NĂNG ===== */}
        <Card>
          <SectionHeader>
            <IconPurple size={30} />
            <h2>Kỹ năng</h2>
          </SectionHeader>

          {loading ? (
            <TextMuted>Đang tải dữ liệu...</TextMuted>
          ) : skills.length === 0 ? (
            <TextMuted>Chưa có kỹ năng nào.</TextMuted>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Kỹ năng</th>
                  <th>Cấp độ</th>
                  <th>Ngày</th>
                  <th>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((s) => (
                  <tr key={s.id}>
                    <td>{getSkillName(s.skillId)}</td>
                    <td>{s.level}</td>
                    <td>{new Date(s.date).toLocaleDateString()}</td>
                    <td>{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        {/* ===== CHỨNG CHỈ ===== */}
        <Card>
          <SectionHeader>
            <IconPink size={30} />
            <h2>Chứng chỉ</h2>
          </SectionHeader>

          {loading ? (
            <TextMuted>Đang tải dữ liệu...</TextMuted>
          ) : certificates.length === 0 ? (
            <TextMuted>Chưa có chứng chỉ nào.</TextMuted>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Chứng chỉ</th>
                  <th>Kết quả</th>
                  <th>Ngày cấp</th>
                  <th>Nơi cấp</th>
                  <th>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c.id}>
                    <td>{getCertificateName(c.certificateId)}</td>
                    <td>{c.result}</td>
                    <td>{new Date(c.date).toLocaleDateString()}</td>
                    <td>{c.issuer}</td>
                    <td>{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

      </Grid2Col>
    </Container>
  );
}

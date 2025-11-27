// HoSoCaNhan.tsx — FULL VERSION (Fixed close/purple warnings + realtime sync)

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Plus, X, Award, Star } from "lucide-react";

import { UserSkill } from "../../../types/UserSkill";
import { UserCertificate } from "../../../types/UserCertificate";

import { UserCertificateForm } from "./UserCertificateForm";
import { UserSkillForm } from "./UserSkillForm";

import { getAuth } from "firebase/auth";
import { db } from "../../../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

/* USER ID */
const userId = getAuth().currentUser?.uid || "";

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

/* FIXED: shouldForwardProp → không truyền close xuống DOM */
const Btn = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "close"
})<BtnProps>`
  display:flex;
  align-items:center;
  gap:10px;
  padding:16px 40px;
  border-radius:40px;
  font-weight:700;
  font-size:1.2rem;
  cursor:pointer;
  user-select:none;

  border:none;
  color:white;
  box-shadow:0 6px 20px rgba(0, 0, 0, 0.1);

  background:${(p)=>p.close ? "#999" : "linear-gradient(270deg,#a855f7,#ec4899)"};
  background-size:400% 400%;
  animation:${(p)=>p.close ? "none" : gradientAnimation} 8s ease infinite;

  transition:0.35s;

  &:hover { transform:scale(1.07); }
`;

/* FIXED: ShouldForwardProp để ngăn warning purple */
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
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [loading, setLoading] = useState(true);

  /* Real-time Listener */
  useEffect(() => {
    if (!userId) return;

    /* Kỹ năng */
    const skillQuery = query(
      collection(db, "userSkills"),
      where("userId", "==", userId)
    );

    const unsubSkills = onSnapshot(skillQuery, (snap) => {
      const arr: UserSkill[] = [];
      snap.forEach((doc) =>
        arr.push({ id: doc.id, ...(doc.data() as UserSkill) })
      );
      setSkills(arr);
      setLoading(false);
    });

    /* Chứng chỉ */
    const certQuery = query(
      collection(db, "userCertificates"),
      where("userId", "==", userId)
    );

    const unsubCert = onSnapshot(certQuery, (snap) => {
      const arr: UserCertificate[] = [];
      snap.forEach((doc) =>
        arr.push({ id: doc.id, ...(doc.data() as UserCertificate) })
      );
      setCertificates(arr);
    });

    return () => {
      unsubSkills();
      unsubCert();
    };
  }, []);

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
          <UserSkillForm userId={userId} onSaved={() => {}} />
        </FormWrapper>
      )}

      {showCertForm && (
        <FormWrapper>
          <UserCertificateForm userId={userId} onSaved={() => {}} />
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
                    <td>{s.skillId}</td>
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
                    <td>{c.certificateId}</td>
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

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Plus, X, Award, Star } from "lucide-react";
import { getUserSkills } from "../../../services/userSkillService";
import { UserSkill } from "../../../types/UserSkill";
import { UserCertificate } from "../../../types/UserCertificate";
import { getUserCertificates } from "../../../services/userCertificateService";
import { UserCertificateForm } from "./UserCertificateForm";
import { UserSkillForm } from "./UserSkillForm";

const userId = "demo_user_001";

// --- Animations ---
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const glowingBorder = keyframes`
  0% {
    border-image-source: linear-gradient(270deg, #a855f7, #ec4899, #a855f7, #ec4899);
  }
  50% {
    border-image-source: linear-gradient(90deg, #ec4899, #a855f7, #ec4899, #a855f7);
  }
  100% {
    border-image-source: linear-gradient(270deg, #a855f7, #ec4899, #a855f7, #ec4899);
  }
`;

// --- Styled Components ---
const Container = styled.div`
  max-width: 1080px;
  margin: 40px auto 80px;
  padding: 0 24px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
  background: linear-gradient(135deg, #f0e6ff, #ffe6f0);
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 3.6rem;
  font-weight: 900;
  color: #7e22ce;
  margin-bottom: 3rem;
  text-align: center;
  user-select: none;
  text-shadow: 0 0 12px #a855f7;
`;

const BtnGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 28px;
  margin-bottom: 5rem;
  flex-wrap: wrap;
`;

interface BtnProps {
  close?: boolean;
}

const Btn = styled.button<BtnProps>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  border-radius: 40px;
  font-weight: 700;
  font-size: 1.2rem;
  cursor: pointer;
  user-select: none;
  border: none;
  color: white;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.35s ease;
  background: ${(props) =>
    props.close ? "#999" : "linear-gradient(270deg, #a855f7, #ec4899)"};
  background-size: 400% 400%;
  animation: ${(props) => (props.close ? "none" : gradientAnimation)} 8s ease infinite;

  &:hover {
    box-shadow: ${(props) =>
      props.close ? "0 0 12px #555 inset" : "0 8px 30px rgba(0, 0, 0, 0.25)"};
    background-position: 100% 50%;
    transform: scale(1.07);
  }
`;

const FormWrapper = styled.div<{ purple?: boolean }>`
  max-width: 780px;
  margin: 0 auto 5rem;
  padding: 40px 48px;
  border-radius: 40px;
  box-shadow: 0 10px 40px rgba(158, 81, 255, 0.3);
  background: white;
  position: relative;
  overflow: hidden;
  border: 5px solid transparent;
  border-image-slice: 1;
  border-image-source: linear-gradient(270deg, #a855f7, #ec4899, #a855f7, #ec4899);
  animation: ${glowingBorder} 8s ease infinite;
  box-shadow: 0 0 25px rgba(219, 39, 119, 0.3);
`;

/* === CHANGED: stacked layout === */
const Grid2Col = styled.div`
  /* Luôn xếp dọc: mỗi card chiếm 1 dòng (stacked) */
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-top: 40px;
  width: 100%;
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
`;

/* Đồng thời đảm bảo mỗi Card chiếm full width trong container */
const Card = styled.section`
  width: 100%;
  background: white;
  border-radius: 40px;
  box-shadow: 0 18px 50px rgba(124, 58, 237, 0.15);
  padding: 40px 48px;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 0 24px 70px rgba(219, 39, 119, 0.3);
    transform: translateY(-3px);
  }
`;
/* === end change === */

const SectionHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  user-select: none;

  h2 {
    font-size: 2.5rem;
    font-weight: 900;
    color: transparent;
    background: linear-gradient(90deg, #a855f7, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const IconPurple = styled(Star)`
  stroke: #7e22ce;
  filter: drop-shadow(0 0 4px #a855f7);
`;

const IconPink = styled(Award)`
  stroke: #be185d;
  filter: drop-shadow(0 0 5px #ec4899);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 1.15rem;
  color: #444;
  border-radius: 12px;
  overflow: hidden;

  thead tr {
    background: linear-gradient(90deg, #a855f7, #ec4899);
    color: white;
  }

  thead th {
    padding: 16px 24px;
    font-weight: 700;
    user-select: none;
  }

  tbody tr:nth-child(even) {
    background-color: #faf5ff;
  }

  tbody tr:nth-child(odd) {
    background-color: #fff0f6;
  }

  tbody tr:hover {
    background: linear-gradient(90deg, #ec4899, #a855f7);
    color: white;
    transition: background 0.3s ease;
    cursor: default;
  }

  tbody td {
    padding: 16px 24px;
    border-bottom: 1px solid #f3e8ff;
  }
`;

const TextMuted = styled.p`
  font-style: italic;
  color: #666;
  padding: 24px 0;
  text-align: center;
`;

// ------------------------

export default function ProfilePage() {
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([getUserSkills(userId), getUserCertificates(userId)]);
      setSkills(s);
      setCertificates(c);
    } catch {
      alert("Lỗi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Container>
      <Title>Hồ sơ năng lực</Title>

      <BtnGroup>
        <Btn close={showSkillForm} onClick={() => setShowSkillForm((v) => !v)} aria-label="Toggle skill form">
          {showSkillForm ? <X size={20} /> : <Plus size={20} />}
          <span>{showSkillForm ? "Đóng Kỹ năng" : "Thêm Kỹ năng"}</span>
        </Btn>

        <Btn close={showCertForm} onClick={() => setShowCertForm((v) => !v)} aria-label="Toggle certificate form">
          {showCertForm ? <X size={20} /> : <Plus size={20} />}
          <span>{showCertForm ? "Đóng Chứng chỉ" : "Thêm Chứng chỉ"}</span>
        </Btn>
      </BtnGroup>

      {showSkillForm && (
        <FormWrapper purple>
          <UserSkillForm userId={userId} onSaved={loadData} />
        </FormWrapper>
      )}
      {showCertForm && (
        <FormWrapper>
          <UserCertificateForm userId={userId} onSaved={loadData} />
        </FormWrapper>
      )}

      <Grid2Col>
        <Card>
          <SectionHeader>
            <IconPurple size={30} />
            <h2>Kỹ năng</h2>
          </SectionHeader>

          {loading ? (
            <TextMuted>Đang tải kỹ năng...</TextMuted>
          ) : skills.length === 0 ? (
            <TextMuted>Chưa có kỹ năng nào.</TextMuted>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Tên kỹ năng</th>
                  <th>Cấp độ</th>
                  <th>Ngày</th>
                  <th>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill.id}>
                    <td>{skill.skillId}</td>
                    <td>{skill.level}</td>
                    <td>{new Date(skill.date).toLocaleDateString()}</td>
                    <td>{skill.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <SectionHeader>
            <IconPink size={30} />
            <h2>Chứng chỉ</h2>
          </SectionHeader>

          {loading ? (
            <TextMuted>Đang tải chứng chỉ...</TextMuted>
          ) : certificates.length === 0 ? (
            <TextMuted>Chưa có chứng chỉ nào.</TextMuted>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Tên chứng chỉ</th>
                  <th>Kết quả</th>
                  <th>Ngày cấp</th>
                  <th>Nơi cấp</th>
                  <th>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr key={cert.id}>
                    <td>{cert.certificateId}</td>
                    <td>{cert.result}</td>
                    <td>{new Date(cert.date).toLocaleDateString()}</td>
                    <td>{cert.issuer}</td>
                    <td>{cert.description}</td>
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

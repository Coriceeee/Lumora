// FILE: src/utils/CareerMatchEngine.ts
// Auto-career match based on AI-generated "reason"

import {
  Career,
  SkillToImprove,
  SubjectToFocus,
  CertificateToAdd,
} from "../../../../types/CareerDashboard";

// ------------------------ KEYWORD GROUPS ------------------------

const SUBJECT_KEYWORDS: Record<string, string[]> = {
  math: ["toán", "logic", "phân tích", "thống kê", "số liệu"],
  literature: ["văn", "viết", "ngôn ngữ", "soạn thảo", "content"],
  english: ["ielts", "toeic", "tiếng anh", "english"],
  physics: ["lý", "vật lý", "cơ học"],
  chemistry: ["hóa", "thí nghiệm", "phản ứng"],
  it: ["tin học", "cntt", "computer", "it basics"],
};

const SKILL_KEYWORDS: Record<string, string[]> = {
  programming: ["lập trình", "code", "developer", "phần mềm"],
  communication: ["giao tiếp", "communication", "trình bày"],
  teamwork: ["team", "hợp tác", "làm nhóm"],
  creativity: ["sáng tạo", "creative", "design"],
  analysis: ["phân tích", "analysis", "logic"],
  office: ["excel", "word", "powerpoint", "office", "tin học văn phòng"],
};

const CERTIFICATE_KEYWORDS: Record<string, string[]> = {
  mos: ["mos", "microsoft office"],
  ic3: ["ic3"],
  ielts: ["ielts", "toeic", "english certificate"],
  it: ["chứng chỉ cntt", "coding certificate", "it certificate"],
};

// ------------------------ HELPER ------------------------

const textIncludes = (text: string, keywords: string[]) => {
  return keywords.some((k) => text.includes(k.toLowerCase()));
};

// ------------------------ MAIN ENGINE ------------------------

export function calculateCareerMatch_C2(
  careers: Career[],
  subjects: SubjectToFocus[],
  skills: SkillToImprove[],
  certs: CertificateToAdd[]
): Career[] {
  return careers.map((career) => {
    const reason = (career.reason || "").toLowerCase();

    // ----- SUBJECT MATCH -----
    let subjectScore = 0;
    subjects.forEach((sub) => {
      const subName = sub.name.toLowerCase();
      const matched = Object.values(SUBJECT_KEYWORDS).some((keys) =>
        textIncludes(reason, keys)
      );
      if (matched) subjectScore += Number(sub.score || 0);
    });
    const matchSubjects = subjects.length
      ? (subjectScore / (subjects.length * 100)) * 100
      : 0;

    // ----- SKILL MATCH -----
    let skillScore = 0;
    skills.forEach((sk) => {
      const matched = Object.values(SKILL_KEYWORDS).some((keys) =>
        textIncludes(reason, keys)
      );
      if (matched)
        skillScore += Number(sk.priorityRatio || sk.priority || 0) * 10;
    });
    const matchSkills = skills.length
      ? skillScore / (skills.length * 100)
      : 0;

    // ----- CERT MATCH -----
    let certScore = 0;
    certs.forEach((c) => {
      const matched = Object.values(CERTIFICATE_KEYWORDS).some((keys) =>
        textIncludes(reason, keys)
      );
      if (matched)
        certScore += Number(c.priorityRatio || c.priority || 0) * 10;
    });
    const matchCerts = certs.length ? certScore / (certs.length * 100) : 0;

    // ----- FINAL SCORE -----
    const finalMatch =
      matchSubjects * 0.4 + matchSkills * 0.4 + matchCerts * 0.2;

    return {
      ...career,
      matchPercentage: Math.round(finalMatch * 100),
    };
  });
}

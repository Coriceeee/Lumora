import { LearningResult } from "../../../../types/LearningResult";
import {
  careerRequirements as defaultCareerRequirements,
  CareerRequirement,
} from "./careerRequirements";

export type SubjectScoreMap = Record<string, number>;
export type CareerRequirementMatrix = Record<string, CareerRequirement & { aliases?: string[] }>;

export interface CareerReadinessInput {
  careerName: string;
  learningResults: LearningResult[];
  includeSimulations?: boolean;
  careerRequirementsOverride?: CareerRequirementMatrix;
}

export interface CareerReadinessDetail {
  name: string;
  score: number;
  weight: number;
  contribution: number;
}

export interface CareerSimulation {
  subject: string;
  improveBy: number;
  oldReadinessScore: number;
  newReadinessScore: number;
  impact: number;
}

export interface CareerReadinessResult {
  careerName: string;
  readinessScore: number;
  subjectScore: number;
  skillScore: number;
  strengths: string[];
  weaknesses: string[];
  nextFocus: string[];
  subjectDetails: CareerReadinessDetail[];
  skillDetails: CareerReadinessDetail[];
  simulations: CareerSimulation[];
}

const clamp = (value: number, min = 0, max = 100): number => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
};

const toNumber = (value: any, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeText = (text?: string): string => {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const normalizeSubjectName = (subject?: string): string => {
  const raw = String(subject ?? "").trim();
  const key = normalizeText(raw);

  const aliases: Record<string, string> = {
    toan: "Toán",
    "toan hoc": "Toán",
    van: "Ngữ văn",
    "ngu van": "Ngữ văn",
    anh: "Tiếng Anh",
    "tieng anh": "Tiếng Anh",
    english: "Tiếng Anh",
    tin: "Tin học",
    "tin hoc": "Tin học",
    cntt: "Tin học",
    ly: "Vật lý",
    "vat ly": "Vật lý",
    hoa: "Hóa học",
    "hoa hoc": "Hóa học",
    sinh: "Sinh học",
    "sinh hoc": "Sinh học",
    su: "Lịch sử",
    "lich su": "Lịch sử",
    dia: "Địa lý",
    "dia ly": "Địa lý",
    gdcd: "Giáo dục kinh tế và pháp luật",
    "giao duc cong dan": "Giáo dục kinh tế và pháp luật",
    "giao duc kinh te va phap luat": "Giáo dục kinh tế và pháp luật",
  };

  return aliases[key] ?? raw;
};

const scoreTo100 = (score: number): number => {
  const n = toNumber(score, 0);
  return n <= 10 ? clamp(n * 10) : clamp(n);
};

const CAREER_ALIAS: Record<string, string> = {
  "lap trinh vien phan mem": "Công nghệ thông tin",
  "ky su phan mem": "Công nghệ thông tin",
  "software engineer": "Công nghệ thông tin",
  "cong nghe thong tin": "Công nghệ thông tin",
  cntt: "Công nghệ thông tin",

  "tri tue nhan tao": "Trí tuệ nhân tạo",
  "ai engineer": "Trí tuệ nhân tạo",
  "ky su ai": "Trí tuệ nhân tạo",
  "machine learning engineer": "Trí tuệ nhân tạo",

  "khoa hoc du lieu": "Khoa học dữ liệu",
  "data scientist": "Khoa học dữ liệu",
  "phan tich du lieu": "Khoa học dữ liệu",
  "data analyst": "Khoa học dữ liệu",

  marketing: "Marketing",
  "digital marketing": "Marketing",

  "quan tri kinh doanh": "Quản trị kinh doanh",
  "chu chuoi cua hang ban le": "Chủ chuỗi cửa hàng bán lẻ",
  "chu doanh nghiep": "Quản trị kinh doanh",
  "business owner": "Quản trị kinh doanh",
  "retail chain owner": "Chủ chuỗi cửa hàng bán lẻ",
  "ceo chuoi ban le": "Chủ chuỗi cửa hàng bán lẻ",
  "kinh doanh": "Kinh doanh",

  "tai chinh ngan hang": "Tài chính - Ngân hàng",
  "tai chinh - ngan hang": "Tài chính - Ngân hàng",
  "ke toan": "Kế toán",

  "thiet ke do hoa": "Thiết kế đồ họa",
  "graphic designer": "Thiết kế đồ họa",

  luat: "Luật",
  "luat su": "Luật",

  "y khoa": "Y khoa",
  "bac si": "Y khoa",

  duoc: "Dược học",
  "duoc hoc": "Dược học",

  "su pham": "Sư phạm",
  "giao vien": "Sư phạm",
};

const getCareerRequirement = (
  careerName: string,
  requirements: CareerRequirementMatrix = defaultCareerRequirements as CareerRequirementMatrix
): CareerRequirement | undefined => {
  const normalizedCareer = normalizeText(careerName);

  const aliasTarget = CAREER_ALIAS[normalizedCareer];
  if (aliasTarget && requirements[aliasTarget]) {
    return requirements[aliasTarget];
  }

  if (requirements[careerName]) {
    return requirements[careerName];
  }

  const foundByAlias = Object.values(requirements).find((item) =>
    (item.aliases || []).some((alias) => {
      const normalizedAlias = normalizeText(alias);

      return (
        normalizedAlias === normalizedCareer ||
        normalizedCareer.includes(normalizedAlias) ||
        normalizedAlias.includes(normalizedCareer)
      );
    })
  );

  if (foundByAlias) return foundByAlias;

  const foundKey = Object.keys(requirements).find((key) => {
    const normalizedKey = normalizeText(key);

    return (
      normalizedKey === normalizedCareer ||
      normalizedCareer.includes(normalizedKey) ||
      normalizedKey.includes(normalizedCareer)
    );
  });

  return foundKey ? requirements[foundKey] : undefined;
};

const weightedAverage = (details: CareerReadinessDetail[]): number => {
  const totalWeight = details.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return 0;

  const total = details.reduce(
    (sum, item) => sum + item.score * item.weight,
    0
  );

  return clamp(total / totalWeight);
};

export function buildSubjectScoreMap(
  learningResults: LearningResult[]
): SubjectScoreMap {
  const grouped: Record<string, number[]> = {};

  learningResults.forEach((result: any) => {
    const subjectName = normalizeSubjectName(
      result.subjectName || result.subjectCode || result.subjectId || result.name
    );

    if (!subjectName) return;

    if (!grouped[subjectName]) grouped[subjectName] = [];

    if (Number.isFinite(Number(result.score))) {
      grouped[subjectName].push(scoreTo100(Number(result.score)));
    }

    if (Number.isFinite(Number(result.average))) {
      grouped[subjectName].push(scoreTo100(Number(result.average)));
    }

    if (Array.isArray(result.assessments)) {
      result.assessments.forEach((assessment: any) => {
        if (Number.isFinite(Number(assessment?.score))) {
          grouped[subjectName].push(scoreTo100(Number(assessment.score)));
        }
      });
    }
  });

  const subjectScores: SubjectScoreMap = {};

  Object.entries(grouped).forEach(([subject, scores]) => {
    if (!scores.length) return;

    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    subjectScores[subject] = Math.round(clamp(avg));
  });

  return subjectScores;
}

const getSubjectScore = (
  subjectScores: SubjectScoreMap,
  subjectName: string
): number => {
  const normalizedTarget = normalizeSubjectName(subjectName);
  const exact = subjectScores[normalizedTarget];

  if (Number.isFinite(exact)) return exact;

  const foundKey = Object.keys(subjectScores).find(
    (key) => normalizeText(key) === normalizeText(normalizedTarget)
  );

  return foundKey ? subjectScores[foundKey] : 0;
};

const SKILL_SUBJECT_PROXY: Record<string, Record<string, number>> = {
  logic: {
    Toán: 0.6,
    "Tin học": 0.4,
  },

  problemSolving: {
    Toán: 0.45,
    "Tin học": 0.35,
    "Vật lý": 0.2,
  },

  selfLearning: {
    Toán: 0.25,
    "Tin học": 0.25,
    "Tiếng Anh": 0.25,
    "Ngữ văn": 0.25,
  },

  teamwork: {
    "Ngữ văn": 0.35,
    "Tiếng Anh": 0.35,
    "Tin học": 0.3,
  },

  communication: {
    "Ngữ văn": 0.45,
    "Tiếng Anh": 0.4,
    "Lịch sử": 0.15,
  },

  research: {
    Toán: 0.3,
    "Tin học": 0.3,
    "Tiếng Anh": 0.2,
    "Ngữ văn": 0.2,
  },

  dataAnalysis: {
    Toán: 0.5,
    "Tin học": 0.4,
    "Tiếng Anh": 0.1,
  },

  creativity: {
    "Ngữ văn": 0.4,
    "Tiếng Anh": 0.25,
    "Tin học": 0.2,
    "Lịch sử": 0.15,
  },

  leadership: {
    "Ngữ văn": 0.35,
    "Tiếng Anh": 0.35,
    "Lịch sử": 0.3,
  },

  perseverance: {
    Toán: 0.25,
    "Hóa học": 0.25,
    "Sinh học": 0.25,
    "Tiếng Anh": 0.25,
  },

  empathy: {
    "Ngữ văn": 0.4,
    "Sinh học": 0.25,
    "Lịch sử": 0.2,
    "Tiếng Anh": 0.15,
  },
};

const estimateSkillScore = (
  skillName: string,
  subjectScores: SubjectScoreMap
): number => {
  const proxy = SKILL_SUBJECT_PROXY[skillName];

  if (!proxy) return 50;

  let totalWeight = 0;
  let totalScore = 0;

  Object.entries(proxy).forEach(([subject, weight]) => {
    const score = getSubjectScore(subjectScores, subject);

    if (score > 0) {
      totalWeight += weight;
      totalScore += score * weight;
    }
  });

  if (totalWeight <= 0) return 50;

  return clamp(totalScore / totalWeight);
};

export function calculateCareerReadiness(
  input: CareerReadinessInput
): CareerReadinessResult {
  const {
    careerName,
    learningResults,
    includeSimulations = true,
    careerRequirementsOverride,
  } = input;

  const requirements =
    careerRequirementsOverride ||
    (defaultCareerRequirements as CareerRequirementMatrix);

  const requirement = getCareerRequirement(careerName, requirements);

  if (!requirement) {
    return {
      careerName,
      readinessScore: 0,
      subjectScore: 0,
      skillScore: 0,
      strengths: [],
      weaknesses: [],
      nextFocus: [],
      subjectDetails: [],
      skillDetails: [],
      simulations: [],
    };
  }

  const subjectScores = buildSubjectScoreMap(learningResults);

  const subjectDetails: CareerReadinessDetail[] = Object.entries(
    (requirement.subjects || {}) as Record<string, number>
  ).map(([subject, weight]) => {
    const score = getSubjectScore(subjectScores, subject);

    return {
      name: subject,
      score,
      weight,
      contribution: score * weight,
    };
  });

  const skillDetails: CareerReadinessDetail[] = Object.entries(
    (requirement.skills || {}) as Record<string, number>
  ).map(([skill, weight]) => {
    const score = estimateSkillScore(skill, subjectScores);

    return {
      name: skill,
      score: Math.round(score),
      weight,
      contribution: score * weight,
    };
  });

  const subjectScore = Math.round(weightedAverage(subjectDetails));
  const skillScore = Math.round(weightedAverage(skillDetails));

  const readinessScore = Math.round(
    clamp(subjectScore * 0.7 + skillScore * 0.3)
  );

  const strengths = subjectDetails
    .filter((item) => item.score >= 80)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.name);

  const weakSubjects = subjectDetails
    .filter((item) => item.score > 0 && item.score < 70)
    .sort((a, b) => a.score - b.score)
    .map((item) => item.name);

  const missingSubjects = subjectDetails
    .filter((item) => item.score <= 0)
    .map((item) => item.name);

  const weaknesses = [...weakSubjects, ...missingSubjects];
  const nextFocus = weaknesses.slice(0, 3);

  const simulations = includeSimulations
    ? simulateSubjectImprovement({
        careerName,
        learningResults,
        improveBy: 1,
      })
    : [];

  return {
    careerName,
    readinessScore,
    subjectScore,
    skillScore,
    strengths,
    weaknesses,
    nextFocus,
    subjectDetails,
    skillDetails,
    simulations,
  };
}

export function simulateSubjectImprovement(params: {
  careerName: string;
  learningResults: LearningResult[];
  improveBy?: number;
  careerRequirementsOverride?: CareerRequirementMatrix;
}): CareerSimulation[] {
  const {
    careerName,
    learningResults,
    improveBy = 1,
    careerRequirementsOverride,
  } = params;

  const requirements =
    careerRequirementsOverride ||
    (defaultCareerRequirements as CareerRequirementMatrix);

  const requirement = getCareerRequirement(careerName, requirements);

  if (!requirement) return [];

  const subjectScores = buildSubjectScoreMap(learningResults);

  const baseResult = calculateCareerReadiness({
    careerName,
    learningResults,
    includeSimulations: false,
    careerRequirementsOverride: requirements,
  });

  return Object.keys((requirement.subjects || {}) as Record<string, number>).map(
    (subject) => {
      const oldSubjectScore = getSubjectScore(subjectScores, subject);
      const improvedSubjectScore = clamp(oldSubjectScore + improveBy * 10);

      const simulatedResults = upsertSubjectScore(
        learningResults,
        subject,
        improvedSubjectScore
      );

      const newResult = calculateCareerReadiness({
        careerName,
        learningResults: simulatedResults,
        includeSimulations: false,
        careerRequirementsOverride: requirements,
      });

      return {
        subject,
        improveBy,
        oldReadinessScore: baseResult.readinessScore,
        newReadinessScore: newResult.readinessScore,
        impact: newResult.readinessScore - baseResult.readinessScore,
      };
    }
  );
}

function upsertSubjectScore(
  learningResults: LearningResult[],
  subjectName: string,
  score100: number
): LearningResult[] {
  const normalizedTarget = normalizeSubjectName(subjectName);
  let updated = false;

  const next = learningResults.map((result: any) => {
    const currentSubject = normalizeSubjectName(
      result.subjectName || result.subjectCode || result.subjectId || result.name
    );

    if (normalizeText(currentSubject) !== normalizeText(normalizedTarget)) {
      return result;
    }

    updated = true;

    return {
      ...result,
      subjectName,
      score: score100 / 10,
    };
  });

  if (!updated) {
    next.push({
      id: `simulation-${subjectName}`,
      userId: "",
      subjectName,
      score: score100 / 10,
      date: new Date().toISOString(),
    } as any);
  }

  return next;
}

export function getReadinessLabel(score: number): string {
  if (score >= 85) return "Rất sẵn sàng";
  if (score >= 70) return "Có tiềm năng tốt";
  if (score >= 50) return "Cần củng cố thêm";
  return "Cần xây nền tảng";
}

export function getTopSimulationImpact(
  simulations: CareerSimulation[]
): CareerSimulation | null {
  if (!simulations.length) return null;

  return [...simulations].sort((a, b) => b.impact - a.impact)[0];
}
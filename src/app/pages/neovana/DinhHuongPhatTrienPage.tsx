import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { collection, getDocs } from "firebase/firestore";

import {
  addCareerDashboard,
  deleteCareerDashboard,
  getCareerDashboardsByUser,
} from "../../../services/careerDashboardService";
import { generateCareerDashboard } from "../../../services/neovanaDashboardService";
import { getLearningResultsByUser } from "../../../services/learningResultService";

import { CareerDashboard, SkillToImprove } from "../../../types/CareerDashboard";

import CareersCard from "./components_dinhhuong/CareersCard";
import SkillsCard, { Skill } from "./components_dinhhuong/SkillsCard";
import CertificatesCard from "./components_dinhhuong/CertificatesCard";
import SubjectsCard from "./components_dinhhuong/SubjectsCard";
import SummaryCard from "./components_dinhhuong/SummaryCard";
import SuggestionDialog from "./components_dinhhuong/SuggestionDialog";
import CareerSimulationCard from "./components_dinhhuong/CareerSimulationCard";
import CareerPathForecastCard from "./components_dinhhuong/CareerPathForecastCard";

import "./timeline.css";
import { useFirebaseUser } from "../../hooks/useFirebaseUser";
import { toast } from "react-toastify";
import { industrySkillProfiles } from "./data/industrySkills";
import { generateRoadmap } from "../../../utils/careerRoadmap";
import {
  calculateCareerReadiness,
  getReadinessLabel,
  CareerReadinessResult,
  CareerSimulation,
  CareerRequirementMatrix,
} from "./utils/CareerReadinessEngine";
import { generatePathFinderForecast } from "./utils/PathFinderEngine";
import { careerRequirements as defaultCareerRequirements } from "./utils/careerRequirements";
import { db } from "../../../firebase/firebase";

const SKILL_LABELS: Record<string, string> = {
  logic: "Tư duy logic",
  problemSolving: "Giải quyết vấn đề",
  selfLearning: "Tự học",
  communication: "Giao tiếp",
  teamwork: "Làm việc nhóm",
  research: "Nghiên cứu",
  dataAnalysis: "Phân tích dữ liệu",
  creativity: "Sáng tạo",
  leadership: "Lãnh đạo",
  perseverance: "Kiên trì",
  empathy: "Đồng cảm",
};

interface IndustryProfile {
  description: string;
  coreSkills: string[];
  keySubjects: string[];
  workEnv: string;
  roles: string[];
  skills: Record<string, number>;
}

type SkillGapItem = {
  skill: string;
  gap: number;
};

const floatingCardStyle: React.CSSProperties = {
  borderRadius: 20,
  background: "linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)",
  boxShadow: "0 20px 50px rgba(79,70,229,0.18)",
  border: "1px solid rgba(79,70,229,0.18)",
  marginBottom: 24,
};

const softCardStyle: React.CSSProperties = {
  borderRadius: 20,
  background: "#fff",
  boxShadow: "0 12px 35px rgba(0,0,0,0.08)",
  border: "1px solid rgba(0,0,0,0.06)",
  marginBottom: 24,
};

function pct(n: number): number {
  const x = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function buildUserSkills(selected?: CareerDashboard | null) {
  const fromBackend = (selected as any)?.userSkills as
    | Record<string, number>
    | undefined;

  if (fromBackend && typeof fromBackend === "object") {
    return fromBackend;
  }

  const arr = selected?.skillsToImprove || [];
  const map: Record<string, number> = {};

  arr.forEach((skill) => {
    const ratio = Math.max(
      0,
      Math.min(1, Number(skill.priorityRatio) || 0)
    );

    map[skill.name] = Math.round((1 - ratio) * 100);
  });

  return map;
}


function toPriorityPercent(value: any): number {
  const raw = Number(value) || 0;
  const percent = raw <= 1 ? raw * 100 : raw;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getCareerPercent(career: any): number {
  return clampScore(Number(career?.fitScore ?? career?.percent ?? career?.matchPercentage ?? 0));
}

function getFallbackCareerReadiness(
  selectedCareer: string,
  selected?: CareerDashboard | null
): CareerReadinessResult | null {
  if (!selectedCareer || !selected) return null;

  const selectedCareerItem =
    (selected.careers || []).find(
      (career: any) => String(career?.name || "").trim() === selectedCareer
    ) || (selected.careers || [])[0];

  const fallbackScore = getCareerPercent(selectedCareerItem);
  const aiSubjects = ((selected as any)?.subjectsToFocus || []) as any[];
  const aiSkills = ((selected as any)?.skillsToImprove || []) as any[];

  const subjectDetails = aiSubjects.map((subject, index) => {
    const priorityPercent = toPriorityPercent(subject?.priorityRatio);
    const score = clampScore(100 - priorityPercent);

    return {
      name: String(subject?.name || `Môn học ${index + 1}`),
      score,
      weight: Math.max(0.1, priorityPercent / 100 || 0.2),
      contribution: score * Math.max(0.1, priorityPercent / 100 || 0.2),
    };
  });

  const skillDetails = aiSkills.map((skill, index) => {
    const priorityPercent = toPriorityPercent(skill?.priorityRatio);
    const score = clampScore(100 - priorityPercent);

    return {
      name: String(skill?.name || `Kỹ năng ${index + 1}`),
      score,
      weight: Math.max(0.1, priorityPercent / 100 || 0.2),
      contribution: score * Math.max(0.1, priorityPercent / 100 || 0.2),
    };
  });

  const strengths = subjectDetails
    .filter((item) => item.score >= 70)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.name)
    .slice(0, 4);

  const weaknesses = subjectDetails
    .filter((item) => item.score < 70)
    .sort((a, b) => a.score - b.score)
    .map((item) => item.name);

  const nextFocus = weaknesses.length
    ? weaknesses.slice(0, 3)
    : subjectDetails
        .sort((a, b) => a.score - b.score)
        .map((item) => item.name)
        .slice(0, 3);

  const baseScore = fallbackScore || 50;
  const simulations: CareerSimulation[] = nextFocus.map((subject, index) => {
    const impact = Math.max(1, 4 - index);
    return {
      subject,
      improveBy: 1,
      oldReadinessScore: baseScore,
      newReadinessScore: clampScore(baseScore + impact),
      impact,
    };
  });

  const avg = (items: { score: number }[]) =>
    items.length
      ? clampScore(items.reduce((sum, item) => sum + item.score, 0) / items.length)
      : baseScore;

  return {
    careerName: selectedCareer,
    readinessScore: baseScore,
    subjectScore: avg(subjectDetails),
    skillScore: avg(skillDetails),
    strengths,
    weaknesses,
    nextFocus,
    subjectDetails,
    skillDetails,
    simulations,
  };
}

function getAllSkillsUnion(a: SkillGapItem[], b: SkillGapItem[]) {
  const set = new Set<string>();

  a.forEach((item) => set.add(item.skill));
  b.forEach((item) => set.add(item.skill));

  return Array.from(set);
}

function toGapMap(gaps: SkillGapItem[]) {
  const map: Record<string, number> = {};

  gaps.forEach((gap) => {
    map[gap.skill] = pct(gap.gap);
  });

  return map;
}

function computeSkillGap(
  userSkills: Record<string, number>,
  selectedCareer: string
): SkillGapItem[] {
  const industryProfile = industrySkillProfiles[selectedCareer] as
    | IndustryProfile
    | undefined;

  if (!industryProfile || !industryProfile.skills) return [];

  const skillGaps: SkillGapItem[] = [];

  for (const skillName in industryProfile.skills) {
    if (
      Object.prototype.hasOwnProperty.call(
        industryProfile.skills,
        skillName
      )
    ) {
      const industryProficiency = pct(industryProfile.skills[skillName]);
      const userProficiency = pct(userSkills[skillName] || 0);
      const gap = Math.max(0, industryProficiency - userProficiency);

      skillGaps.push({
        skill: skillName,
        gap,
      });
    }
  }

  return skillGaps
    .filter((item) => item.gap > 0)
    .sort((a, b) => b.gap - a.gap);
}

interface SkillGapRadarProps {
  axes: string[];
  seriesA: {
    label: string;
    map: Record<string, number>;
  };
  seriesB?: {
    label: string;
    map: Record<string, number>;
  };
}

const SkillGapRadar: React.FC<SkillGapRadarProps> = ({
  axes,
  seriesA,
  seriesB,
}) => {
  const dataA = axes.map((skill) => ({
    skill,
    valueA: seriesA.map[skill] || 0,
    valueB: seriesB?.map?.[skill] || null,
  }));

  if (dataA.length === 0) {
    return (
      <Typography sx={{ mt: 2 }}>
        Không có khoảng cách kỹ năng đáng kể với ngành này.
      </Typography>
    );
  }

  const maxGap = Math.max(...dataA.map((item) => item.valueA));

  return (
    <Box
      sx={{
        mt: 2,
        p: 3,
        borderRadius: 3,
        background: "#f8f9ff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      <Typography sx={{ fontWeight: 800, mb: 2 }}>
        🧠 Phân tích chi tiết từng kỹ năng
      </Typography>

      {dataA.map((item, index) => {
        const isMax = item.valueA === maxGap;

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              background: isMax ? "#eef2ff" : "#fff",
              border: isMax
                ? "2px solid #4f46e5"
                : "1px solid #e0e0e0",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>
              {item.skill}
              {isMax && (
                <span style={{ color: "#4f46e5", marginLeft: 8 }}>
                  ⭐ Khoảng cách lớn nhất
                </span>
              )}
            </Typography>

            <Typography sx={{ fontSize: 14, mt: 0.5 }}>
              Khoảng cách hiện tại: <strong>{item.valueA}</strong> điểm
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

const DinhHuongPhatTrienPage: React.FC = () => {
  const [dashboards, setDashboards] = useState<CareerDashboard[]>([]);
  const [selected, setSelected] = useState<CareerDashboard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [learningResults, setLearningResults] = useState<any[]>([]);
  const [careerRequirementMatrix, setCareerRequirementMatrix] =
    useState<CareerRequirementMatrix>(
      defaultCareerRequirements as CareerRequirementMatrix
    );

  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  const [deletingId, setDeletingId] = useState<string>("");

  const [compareCareer, setCompareCareer] = useState<string>("");

  const { userId } = useFirebaseUser();

  const loadDashboards = async () => {
    if (!userId) return;

    try {
      const data = (await getCareerDashboardsByUser(userId)) || [];

      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setDashboards(sorted);

      setSelected((currentSelected) => {
        if (!sorted.length) return null;

        if (currentSelected?.id) {
          const stillExists = sorted.find(
            (dashboard) => dashboard.id === currentSelected.id
          );

          if (stillExists) return stillExists;
        }

        return sorted[0];
      });
    } catch (error) {
      console.error("Lỗi tải lịch sử phân tích:", error);
      toast.error("Không thể tải lịch sử phân tích.");
    }
  };

  const loadLearningResults = async () => {
    if (!userId) return;

    try {
      const data = await getLearningResultsByUser(userId);
      setLearningResults(data || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu học tập:", error);
    }
  };

  const loadCareerRequirementMatrix = async () => {
    try {
      const snap = await getDocs(collection(db, "careerRequirements"));
      const firestoreMatrix: CareerRequirementMatrix = {};

      snap.forEach((docSnap) => {
        const data = docSnap.data() as any;

        if (data?.isActive === false) return;

        const name = String(data?.name || docSnap.id || "").trim();
        if (!name) return;

        firestoreMatrix[name] = {
          subjects: data?.subjects || {},
          skills: data?.skills || {},
          aliases: Array.isArray(data?.aliases) ? data.aliases : [],
        };
      });

      setCareerRequirementMatrix({
        ...(defaultCareerRequirements as CareerRequirementMatrix),
        ...firestoreMatrix,
      });
    } catch (error) {
      console.error(
        "Không thể tải Career Requirement Matrix từ Firebase, dùng dữ liệu mặc định:",
        error
      );

      setCareerRequirementMatrix(
        defaultCareerRequirements as CareerRequirementMatrix
      );
    }
  };

  useEffect(() => {
    if (!userId) return;

    void loadDashboards();
    void loadLearningResults();
    void loadCareerRequirementMatrix();
  }, [userId]);

  const handleCreate = () => {
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (formData: any) => {
    if (!userId) {
      toast.error("Không tìm thấy userId");
      return;
    }

    setAiLoading(true);
    setAiDone(false);

    try {
      const dashboard = await generateCareerDashboard(userId, formData);

      const saved = await addCareerDashboard({
        ...dashboard,
        userId,
      });

      await loadDashboards();
      await loadLearningResults();
      setSelected(saved);

      setAiDone(true);
      setDialogOpen(false);
      toast.success("AI đã phân tích xong!");

      setTimeout(() => {
        setAiDone(false);
      }, 1800);
    } catch (error: unknown) {
      console.error("Lỗi tạo định hướng nghề nghiệp:", error);

      const message =
        error instanceof Error
          ? error.message
          : "AI phân tích không thành công";

      toast.error(message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteDashboard = async (
    event: React.MouseEvent,
    dashboard: CareerDashboard
  ) => {
    event.stopPropagation();

    if (!dashboard.id) {
      toast.error("Không tìm thấy mã phân tích để xóa.");
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa phân tích "${dashboard.title}" không?`
    );

    if (!confirmed) return;

    setDeletingId(dashboard.id);

    try {
      await deleteCareerDashboard(dashboard.id);

      const remainingDashboards = dashboards.filter(
        (item) => item.id !== dashboard.id
      );

      setDashboards(remainingDashboards);

      if (selected?.id === dashboard.id) {
        setSelected(remainingDashboards[0] || null);
      }

      toast.success("Đã xóa bản phân tích.");
    } catch (error) {
      console.error("Lỗi xóa phân tích:", error);
      toast.error("Không thể xóa bản phân tích.");
    } finally {
      setDeletingId("");
    }
  };

  const mapSkills = (skills: SkillToImprove[]): Skill[] =>
    skills.map((skill) => ({
      name: skill.name,
      priority: Number((skill as any).priority) || 0,
      priorityRatio: Math.max(
        0,
        Math.min(1, Number((skill as any).priorityRatio) || 0)
      ),
      reason: (skill as any).reason || "",
    }));

    const mapSubjects = (subjects: any[]): any[] =>
    subjects.map((subject) => {
      const rawPriorityRatio = Number(subject.priorityRatio) || 0;
      const priorityPercent =
        rawPriorityRatio <= 1
          ? Math.round(rawPriorityRatio * 100)
          : Math.round(rawPriorityRatio);

      return {
        name: subject.name,
        priority: Number(subject.priority) || 0,
        // Hiển thị mức ưu tiên theo thang 0 - 100: 0.8 -> 80
        priorityRatio: Math.max(0, Math.min(100, priorityPercent)),
        reason: subject.reason || "",
        recommendation: subject.recommendation || "",
      };
    });

  const sortedCareers = useMemo(() => {
    return [...(selected?.careers || [])].sort(
      (a, b) =>
        Number((b as any).fitScore ?? 0) -
        Number((a as any).fitScore ?? 0)
    );
  }, [selected?.careers]);

  const topCareer = sortedCareers[0];
  const hasCareerData = Boolean(topCareer?.name?.trim());
  const selectedCareer = hasCareerData
    ? String(topCareer?.name).trim()
    : "";

  useEffect(() => {
    const second = sortedCareers?.[1]?.name;

    if (second && second !== selectedCareer) {
      setCompareCareer(second);
    } else {
      setCompareCareer("");
    }
  }, [sortedCareers, selectedCareer]);

  const userSkills = useMemo(() => buildUserSkills(selected), [selected]);

  const skillGapDataA = useMemo(
    () =>
      hasCareerData
        ? computeSkillGap(userSkills, selectedCareer)
        : [],
    [hasCareerData, userSkills, selectedCareer]
  );

  const skillGapDataB = useMemo(() => {
    if (!compareCareer || compareCareer === selectedCareer) return [];

    return computeSkillGap(userSkills, compareCareer);
  }, [userSkills, compareCareer, selectedCareer]);

  const industrySkillsA = hasCareerData
    ? industrySkillProfiles[selectedCareer]?.skills || {}
    : {};

  const matchedCountA = getMatchedSkillCount(userSkills, industrySkillsA);

  const readinessA =
    matchedCountA === 0
      ? null
      : calculateReadiness(userSkills, industrySkillsA);

  const readinessB =
    compareCareer && industrySkillProfiles[compareCareer]
      ? calculateReadiness(
          userSkills,
          industrySkillProfiles[compareCareer].skills
        )
      : null;

  const biggestSkillGapA = skillGapDataA?.[0];
  const biggestSkillGapB = skillGapDataB?.[0];

  const roadmap = useMemo(
    () => (hasCareerData ? generateRoadmap(selectedCareer) : []),
    [hasCareerData, selectedCareer]
  );

  const industry = hasCareerData
    ? ((industrySkillProfiles[selectedCareer] as
        | IndustryProfile
        | undefined) || undefined)
    : undefined;

  const readinessLearningResults = useMemo(() => learningResults || [], [learningResults]);

  const careersWithReadiness = useMemo(() => {
    return sortedCareers.map((career) => {
      const careerName = String(career.name || "").trim();

      const readiness = calculateCareerReadiness({
        careerName,
        learningResults: readinessLearningResults,
        careerRequirementsOverride: careerRequirementMatrix,
      });

      const fallbackPercent = Number(
        (career as any).fitScore ?? (career as any).percent ?? 0
      );

      return {
        ...career,
        readinessScore: readiness.readinessScore,
        percent: readiness.readinessScore || fallbackPercent,
        fitScore: readiness.readinessScore || fallbackPercent,
        strengths: readiness.strengths,
        weaknesses: readiness.weaknesses,
        nextFocus: readiness.nextFocus,
      };
    });
  }, [sortedCareers, readinessLearningResults, careerRequirementMatrix]);

  const careerReadiness = useMemo(() => {
    if (!hasCareerData) return null;

    const calculated = calculateCareerReadiness({
      careerName: selectedCareer,
      learningResults: readinessLearningResults,
      careerRequirementsOverride: careerRequirementMatrix,
    });

    // Nếu ngành do AI sinh ra chưa có trong Career Requirement Matrix
    // thì dùng dữ liệu AI cũ làm fallback để UI không bị mất dữ liệu.
    if (
      calculated.readinessScore > 0 ||
      calculated.subjectDetails.length > 0 ||
      calculated.skillDetails.length > 0
    ) {
      return calculated;
    }

    return getFallbackCareerReadiness(selectedCareer, selected);
  }, [
    hasCareerData,
    selectedCareer,
    readinessLearningResults,
    selected,
    careerRequirementMatrix,
  ]);

  const pathFinderForecast = useMemo(
    () =>
      readinessLearningResults.length > 0
        ? generatePathFinderForecast({
            learningResults: readinessLearningResults,
            limit: 5,
          })
        : null,
    [readinessLearningResults]
  );

  const readinessSubjects = useMemo(() => {
    if (!careerReadiness || !careerReadiness.subjectDetails.length) return [];

    return careerReadiness.subjectDetails.map((item) => {
      const focusPercent = Math.max(0, Math.min(100, Math.round(100 - item.score)));
      const isNextFocus = careerReadiness.nextFocus.includes(item.name);

      return {
        name: item.name,
        priority: item.score < 70 ? 3 : item.score < 85 ? 2 : 1,
        priorityRatio: focusPercent,
        reason: isNextFocus
          ? "Đây là môn cần ưu tiên cải thiện để tăng điểm sẵn sàng nghề nghiệp."
          : "Đây là môn đang có nền tảng tương đối tốt theo dữ liệu học tập thật.",
        recommendation: isNextFocus
          ? "Tập trung cải thiện môn này sẽ giúp tăng mức độ sẵn sàng với ngành mục tiêu."
          : "Duy trì phong độ hiện tại và tiếp tục củng cố kiến thức nền.",
      };
    });
  }, [careerReadiness]);

  const industryFallbackSubjects = useMemo(() => {
    const keySubjects = industry?.keySubjects || [];

    return keySubjects.map((name: string, index: number) => ({
      name,
      priority: index === 0 ? 3 : 2,
      priorityRatio: index === 0 ? 70 : 50,
      reason:
        "Môn học này được lấy từ hồ sơ yêu cầu ngành khi chưa đủ dữ liệu từ ma trận sẵn sàng nghề nghiệp.",
      recommendation:
        "Tiếp tục theo dõi điểm số và cập nhật kết quả học tập để hệ thống tính toán chính xác hơn.",
    }));
  }, [industry]);

  const subjectsForCard = useMemo(() => {
    if (readinessSubjects.length) return readinessSubjects;

    const aiSubjects = mapSubjects(selected?.subjectsToFocus || []);
    if (aiSubjects.length) return aiSubjects;

    return industryFallbackSubjects;
  }, [readinessSubjects, selected, industryFallbackSubjects]);

  const readinessSkills = useMemo(() => {
    if (!careerReadiness || !careerReadiness.skillDetails.length) return [];

    return careerReadiness.skillDetails.map((item) => ({
      name: SKILL_LABELS[item.name] || item.name,
      priority: item.score < 70 ? 3 : item.score < 85 ? 2 : 1,
      priorityRatio: Math.max(0, Math.min(1, item.score / 100)),
      reason:
        item.score < 70
          ? "Đây là kỹ năng cần cải thiện theo mô hình sẵn sàng nghề nghiệp."
          : "Kỹ năng này đang ở mức khá tốt theo mô hình ước lượng từ dữ liệu học tập.",
    }));
  }, [careerReadiness]);

  const skillsForCard = useMemo(() => {
    if (readinessSkills.length) return readinessSkills;
    return mapSkills(selected?.skillsToImprove || []);
  }, [readinessSkills, selected]);

  const matchReasons: string[] = careerReadiness
    ? explainReadinessMatch({
        careerName: selectedCareer,
        readinessScore: careerReadiness.readinessScore,
        strengths: careerReadiness.strengths,
        weaknesses: careerReadiness.weaknesses,
        nextFocus: careerReadiness.nextFocus,
      })
    : hasCareerData
    ? []
    : [];

  const clamp01_100 = (value: number): number =>
    Math.max(0, Math.min(100, value));

  const axes = useMemo(
    () => Object.keys(industry?.skills || {}),
    [industry]
  );

  const axisExplanations = useMemo(() => {
    const requiredSkillsA = hasCareerData
      ? (industrySkillProfiles[selectedCareer] as any)?.skills || {}
      : {};

    const requiredSkillsB = compareCareer
      ? (industrySkillProfiles[compareCareer] as any)?.skills || {}
      : {};

    return axes.map((skill) => {
      const requiredA = clamp01_100(requiredSkillsA?.[skill] ?? 0);
      const requiredB = clamp01_100(requiredSkillsB?.[skill] ?? 0);
      const current = clamp01_100(userSkills?.[skill] ?? 0);

      const gapA = clamp01_100(requiredA - current);
      const gapB = clamp01_100(requiredB - current);

      let text = "";

      if (gapA >= 30) {
        text =
          "Kỹ năng này đang thiếu nhiều so với yêu cầu ngành. Nên ưu tiên học sớm.";
      } else if (gapA >= 15) {
        text =
          "Bạn có nền tảng nhưng cần luyện thêm để theo kịp yêu cầu thực tế.";
      } else {
        text =
          "Mức độ hiện tại khá phù hợp với yêu cầu ngành, nên duy trì và nâng cao.";
      }

      return {
        skill,
        ga: gapA,
        gb: compareCareer ? gapB : 0,
        current,
        requiredA,
        requiredB,
        text,
      };
    });
  }, [axes, userSkills, selectedCareer, compareCareer, hasCareerData]);

  return (
    <>
      {(aiLoading || aiDone) && (
        <div className={`ai-overlay ${aiDone ? "fade-out" : "fade-in"}`}>
          <div className="ai-box">
            {aiLoading && (
              <>
                <div className="spinner"></div>
                <p className="ai-text">
                  AI đang phân tích dữ liệu của bạn...
                </p>
              </>
            )}

            {aiDone && (
              <p className="ai-text-done">✅ AI đã phân tích xong!</p>
            )}
          </div>
        </div>
      )}

      <style>{`
        .ai-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.45);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          backdrop-filter: blur(3px);
          transition: opacity .4s ease;
        }

        .fade-in {
          opacity: 1;
        }

        .fade-out {
          opacity: 0;
        }

        .ai-box {
          background: white;
          padding: 30px 40px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          animation: popup .3s ease;
        }

        @keyframes popup {
          from {
            transform: scale(.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 5px solid #ddd;
          border-top-color: #3498db;
          border-radius: 50%;
          animation: spin .9s linear infinite;
          margin: auto;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .ai-text {
          font-size: 18px;
          font-weight: 600;
          margin-top: 18px;
          color: #333;
        }

        .ai-text-done {
          font-size: 22px;
          font-weight: 700;
          color: #2ecc71;
        }

        .neovana-timeline {
          padding-left: 40px;
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .timeline-item {
          position: relative;
          display: flex;
        }

        .timeline-line {
          position: absolute;
          left: 12px;
          top: 0;
          bottom: -20px;
          width: 2px;
          background: #e6c9b8;
          opacity: .9;
        }

        .timeline-dot {
          position: absolute;
          left: 6px;
          top: 18px;
          width: 14px;
          height: 14px;
          background: #fff;
          border: 3px solid #ff8c5a;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(255, 140, 90, 0.4);
        }

        .timeline-card {
          position: relative;
          cursor: pointer;
          background: #fff;
          padding: 14px 48px 14px 20px;
          border-radius: 14px;
          border: 1px solid #eee;
          width: 100%;
          min-height: 82px;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          transition: .25s;
          box-shadow: 0 2px 4px rgba(0,0,0,.06);
        }

        .timeline-card:hover {
          transform: translateX(6px);
          box-shadow: 0 6px 16px rgba(0,0,0,.08);
          border-color: #ffd1b8;
        }

        .timeline-card.selected {
          background: #ffe8dc !important;
          border-color: #ffb08a !important;
          transform: translateX(8px);
          box-shadow: 0 8px 18px rgba(255, 140, 90, .25);
        }

        .timeline-card:focus-visible {
          outline: 2px solid #ff8c5a;
          outline-offset: 2px;
        }

        .timeline-title {
          font-size: 15.5px;
          font-weight: 600;
          color: #333;
          padding-right: 8px;
        }

        .timeline-date {
          font-size: 14px;
          font-weight: 700;
          color: #444;
          margin-top: 2px;
        }

        .timeline-delete-button {
          position: absolute !important;
          top: 50%;
          right: 8px;
          transform: translateY(-50%);
          color: #9ca3af !important;
          background: rgba(255,255,255,0.8) !important;
        }

        .timeline-delete-button:hover {
          color: #ef4444 !important;
          background: #fee2e2 !important;
        }

        .timeline-empty {
          padding: 18px 8px 8px;
          color: #6b7280;
          font-size: 14px;
        }
      `}</style>

      <div className="row g-0 g-xl-5 g-xxl-8">
        <div className="col-xxl-3">
          <div className="card mb-5">
            <div className="card-body">
              <div className="d-flex bg-light-primary card-rounded flex-grow-1">
                <div className="py-10 ps-7">
                  <span className="fw-bolder fs-1 text-gray-800">
                    Nhập thông tin
                  </span>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleCreate}
                    className="btn-create-dashboard hover:bg-blue-600 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md transition-all ease-in-out duration-300"
                  >
                    Định hướng
                  </Button>
                </div>

                <div
                  className="position-relative bgi-no-repeat bgi-size-contain bgi-position-y-bottom bgi-position-x-end mt-6 flex-grow-1"
                  style={{
                    backgroundImage: `url("/media/misc/illustration-1.png")`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="card mb-5">
            <div className="card-body">
              <Typography variant="h6">Lịch sử</Typography>

              <div className="neovana-timeline">
                {dashboards.length === 0 && (
                  <div className="timeline-empty">
                    Chưa có bản phân tích nào.
                  </div>
                )}

                {dashboards.map((dashboard) => {
                  const isSelected = selected?.id === dashboard.id;
                  const isDeleting = deletingId === dashboard.id;

                  return (
                    <div key={dashboard.id} className="timeline-item">
                      <div className="timeline-line"></div>
                      <div className="timeline-dot"></div>

                      <div
                        role="button"
                        tabIndex={0}
                        className={`timeline-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => setSelected(dashboard)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelected(dashboard);
                          }
                        }}
                      >
                        <div className="timeline-title">
                          {dashboard.title}
                        </div>

                        <div className="timeline-date">
                          {new Date(dashboard.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>

                        <Tooltip title="Xóa phân tích">
                          <IconButton
                            aria-label="Xóa phân tích"
                            size="small"
                            disabled={isDeleting}
                            className="timeline-delete-button"
                            onClick={(event: React.MouseEvent<Element, MouseEvent>) =>
                              void handleDeleteDashboard(event, dashboard)
                            }
                          >
                            {isDeleting ? (
                              <CircularProgress size={18} />
                            ) : (
                              <DeleteOutlineIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xxl-9">
          {selected ? (
            <Box>
              <SummaryCard dashboard={selected} />

              <div className="row g-0 g-xl-5 g-xxl-8 mt-4 align-items-start">
                <div className="col-xxl-6 p-4 d-flex align-items-start">
                  {careerReadiness && (
                    <div
                      className="card p-4"
                      style={{
                        ...softCardStyle,
                        width: "100%",
                        height: "fit-content",
                        minHeight: "unset",
                        alignSelf: "flex-start",
                      }}
                    >
                      <h3
                        style={{
                          fontWeight: 900,
                          fontSize: 22,
                          marginBottom: 10,
                        }}
                      >
                        🧭 Điểm sẵn sàng nghề nghiệp
                      </h3>

                      <Typography sx={{ fontSize: 16, mb: 1 }}>
                        Ngành mục tiêu: <strong>{selectedCareer}</strong>
                      </Typography>

                      <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 1 }}>
                        Mức độ sẵn sàng: {careerReadiness.readinessScore}% —{" "}
                        {getReadinessLabel(careerReadiness.readinessScore)}
                      </Typography>

                      <Typography sx={{ color: "#555", mb: 2 }}>
                        Điểm này được tính từ dữ liệu học tập thật, ma trận yêu cầu
                        ngành nghề và mô hình sẵn sàng nghề nghiệp. AI chỉ đóng vai
                        trò diễn giải kết quả.
                      </Typography>

                      {careerReadiness.strengths.length > 0 && (
                        <Typography sx={{ mb: 1 }}>
                          ✅ Điểm mạnh: {careerReadiness.strengths.join(", ")}
                        </Typography>
                      )}

                      {careerReadiness.weaknesses.length > 0 && (
                        <Typography sx={{ mb: 1 }}>
                          ⚠️ Cần cải thiện: {careerReadiness.weaknesses.join(", ")}
                        </Typography>
                      )}
                    </div>
                  )}
                </div>

                <div className="col-xxl-6 p-4 d-flex align-items-start">
                  <div style={{ width: "100%", height: "fit-content" }}>
                  </div>
                </div>
              </div>

              <div className="row g-0 g-xl-5 g-xxl-8 mt-2 align-items-start">
                <div className="col-xxl-12 p-4">
                  {pathFinderForecast && (
                    <CareerPathForecastCard
                      forecasts={pathFinderForecast.topForecasts}
                      message={pathFinderForecast.message}
                    />
                  )}
                </div>

                <div className="col-xxl-12 p-4">
                  <CareersCard careers={careersWithReadiness} />
                </div>
              </div>

              <div className="row g-0 g-xl-5 g-xxl-8 mt-2 align-items-start">
                <div
                  className={
                    hasCareerData && matchReasons.length > 0
                      ? "col-xxl-6 p-4"
                      : "col-xxl-12 p-4"
                  }
                >
                  {careerReadiness && (
                    <CareerSimulationCard
                      careerName={selectedCareer}
                      simulations={careerReadiness.simulations}
                    />
                  )}
                </div>

                {hasCareerData && matchReasons.length > 0 && (
                  <div className="col-xxl-6 p-4">
                    <div
                      className="card p-4"
                      style={{
                        ...softCardStyle,
                        width: "100%",
                        height: "fit-content",
                        minHeight: "unset",
                        alignSelf: "flex-start",
                      }}
                    >
                      <h3
                        style={{
                          fontWeight: 800,
                          fontSize: 20,
                          marginBottom: 8,
                        }}
                      >
                        📌 Vì sao phù hợp ngành "{selectedCareer}"?
                      </h3>

                      <ul>
                        {matchReasons.map((reason: string, index: number) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {hasCareerData && roadmap.length > 0 && (
                <div
                  className="card p-4 mt-4"
                  style={{
                    borderRadius: 22,
                    background:
                      "linear-gradient(135deg, #eef2ff, #ffffff)",
                    boxShadow: "0 12px 30px rgba(79,70,229,0.25)",
                    border: "1px solid rgba(79,70,229,0.2)",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: 900,
                      fontSize: 22,
                      marginBottom: 14,
                    }}
                  >
                    🚀 Lộ trình 90 ngày theo ngành "{selectedCareer}"
                  </h3>

                  {roadmap.map((step, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: 12,
                        padding: "10px 14px",
                        borderRadius: 14,
                        background: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    >
                      <strong style={{ color: "#4f46e5" }}>
                        Tuần {step.week}:
                      </strong>{" "}
                      {step.task}
                    </div>
                  ))}

                  <Typography
                    sx={{
                      mt: 2,
                      fontStyle: "italic",
                      color: "#555",
                    }}
                  >
                    🤖 AI gợi ý: Nếu bạn hoàn thành đều đặn lộ trình
                    này, mức độ phù hợp với ngành sẽ được cải thiện rõ
                    rệt sau 3 tháng.
                  </Typography>
                </div>
              )}
            </Box>
          ) : (
            <Typography>Chưa có dữ liệu.</Typography>
          )}
        </div>
      </div>

      <div className="row g-0 g-xl-5 g-xxl-8 mt-4">
        <div className="col-xxl-6 p-4">
          {selected ? (
            <SkillsCard skills={skillsForCard} />
          ) : (
            <Typography>Không có dữ liệu.</Typography>
          )}
        </div>

        <div className="col-xxl-6 p-4">
          {selected ? (
            <CertificatesCard
              certificates={selected.certificatesToAdd || []}
            />
          ) : (
            <Typography>Chưa có dữ liệu.</Typography>
          )}
        </div>

        <div className="row g-0 g-xl-5 g-xxl-8 mt-4">
          <div className="col-xxl-12 p-4">
            {selected ? (
              <SubjectsCard subjects={subjectsForCard} />
            ) : (
              <Typography>Chưa có dữ liệu.</Typography>
            )}
          </div>
        </div>

        <SuggestionDialog
          open={dialogOpen}
          onClose={() => {
            if (!aiLoading) setDialogOpen(false);
          }}
          onSubmit={handleDialogSubmit}
        />
      </div>
    </>
  );
};

export default DinhHuongPhatTrienPage;

function getMatchedSkillCount(
  userSkills: Record<string, number>,
  industrySkills: Record<string, number>
): number {
  let count = 0;

  for (const skill in industrySkills) {
    if (
      Object.prototype.hasOwnProperty.call(industrySkills, skill) &&
      userSkills[skill] &&
      userSkills[skill] > 0
    ) {
      count++;
    }
  }

  return count;
}

function calculateReadiness(
  userSkills: Record<string, number>,
  industrySkills: Record<string, number>
): number {
  let totalIndustry = 0;
  let totalUser = 0;

  for (const skill in industrySkills) {
    const industryLevel = industrySkills[skill];
    const userLevel = userSkills[skill] ?? 0;

    totalIndustry += industryLevel;
    totalUser += Math.min(userLevel, industryLevel);
  }

  if (totalIndustry === 0) return 0;

  return Math.round((totalUser / totalIndustry) * 100);
}

function explainReadinessMatch({
  careerName,
  readinessScore,
  strengths,
  weaknesses,
  nextFocus,
}: {
  careerName: string;
  readinessScore: number;
  strengths: string[];
  weaknesses: string[];
  nextFocus: string[];
}): string[] {
  const reasons: string[] = [];

  reasons.push(
    `Mức độ sẵn sàng hiện tại với ngành "${careerName}" là ${readinessScore}%.`
  );

  if (strengths.length > 0) {
    reasons.push(
      `Bạn có nền tảng tốt ở ${strengths.slice(0, 3).join(", ")}.`
    );
  }

  if (readinessScore >= 85) {
    reasons.push("Bạn đang có mức độ phù hợp rất cao với ngành này.");
  } else if (readinessScore >= 70) {
    reasons.push(
      "Bạn có tiềm năng phát triển tốt nếu tiếp tục duy trì và cải thiện."
    );
  } else if (readinessScore >= 50) {
    reasons.push("Bạn đã có nền tảng ban đầu nhưng vẫn cần củng cố thêm.");
  } else {
    reasons.push(
      "Bạn cần xây dựng thêm nền tảng để theo đuổi ngành này hiệu quả hơn."
    );
  }

  if (weaknesses.length > 0) {
    reasons.push(
      `Những yếu tố cần cải thiện gồm: ${weaknesses.slice(0, 3).join(", ")}.`
    );
  }

  if (nextFocus.length > 0) {
    reasons.push(
      `Nên ưu tiên tập trung vào ${nextFocus
        .slice(0, 3)
        .join(", ")} để nâng cao điểm sẵn sàng nghề nghiệp.`
    );
  }

  reasons.push(
    "Điểm sẵn sàng nghề nghiệp được tính từ dữ liệu học tập thực tế và ma trận yêu cầu ngành nghề của EduCompass."
  );

  return reasons;
}

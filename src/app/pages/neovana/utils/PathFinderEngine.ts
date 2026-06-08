import { LearningResult } from "../../../../types/LearningResult";
import {
  calculateCareerReadiness,
  CareerReadinessResult,
} from "./CareerReadinessEngine";
import { careerRequirements } from "./careerRequirements";

export interface CareerFuture {
  careerName: string;
  probability: number;
  readinessScore: number;
  subjectScore: number;
  skillScore: number;
  keyFactors: string[];
  weakFactors: string[];
  reasons: string[];
}

export interface PathFinderForecastResult {
  topForecasts: CareerFuture[];
  bestCareer?: CareerFuture;
  secondCareer?: CareerFuture;
  message: string;
}

const clamp = (value: number, min = 0, max = 100): number => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
};

const getTopNames = (items: string[], limit = 3): string[] => {
  return [...new Set(items.filter(Boolean))].slice(0, limit);
};

const buildReasons = (
  careerName: string,
  readiness: CareerReadinessResult,
  probability: number
): string[] => {
  const reasons: string[] = [];

  if (readiness.strengths.length > 0) {
    reasons.push(
      `Có nền tảng tốt ở ${getTopNames(readiness.strengths).join(", ")}.`
    );
  }

  if (readiness.skillScore >= 70) {
    reasons.push("Các kỹ năng nền tảng được ước lượng ở mức khá tốt.");
  }

  if (readiness.subjectScore >= 70) {
    reasons.push("Điểm học tập hiện tại tương đối phù hợp với yêu cầu ngành.");
  }

  if (readiness.weaknesses.length > 0) {
    reasons.push(
      `Cần cải thiện thêm ${getTopNames(readiness.weaknesses).join(
        ", "
      )} để tăng xác suất phát triển.`
    );
  }

  if (probability >= 85) {
    reasons.push("Đây là hướng phát triển rất nổi bật trong hồ sơ hiện tại.");
  } else if (probability >= 70) {
    reasons.push("Đây là hướng phát triển có tiềm năng tốt.");
  } else if (probability >= 50) {
    reasons.push("Đây là hướng có thể cân nhắc nếu có lộ trình cải thiện rõ.");
  } else {
    reasons.push("Hướng này hiện còn khá xa so với nền tảng học tập hiện tại.");
  }

  return reasons;
};

const calculateFutureProbability = (
  readiness: CareerReadinessResult
): number => {
  const readinessPart = readiness.readinessScore * 0.65;
  const subjectPart = readiness.subjectScore * 0.25;
  const skillPart = readiness.skillScore * 0.1;

  const weaknessPenalty = Math.min(12, readiness.weaknesses.length * 2);

  return Math.round(
    clamp(readinessPart + subjectPart + skillPart - weaknessPenalty)
  );
};

export function generatePathFinderForecast(params: {
  learningResults: LearningResult[];
  limit?: number;
}): PathFinderForecastResult {
  const { learningResults, limit = 5 } = params;

  const forecasts: CareerFuture[] = Object.keys(careerRequirements).map(
    (careerName) => {
      const readiness = calculateCareerReadiness({
        careerName,
        learningResults,
        includeSimulations: false,
      });

      const probability = calculateFutureProbability(readiness);

      return {
        careerName,
        probability,
        readinessScore: readiness.readinessScore,
        subjectScore: readiness.subjectScore,
        skillScore: readiness.skillScore,
        keyFactors: getTopNames(readiness.strengths),
        weakFactors: getTopNames(readiness.weaknesses),
        reasons: buildReasons(careerName, readiness, probability),
      };
    }
  );

  const sorted = forecasts
    .filter((item) => item.probability > 0)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, limit);

  const bestCareer = sorted[0];
  const secondCareer = sorted[1];

  let message = "Chưa đủ dữ liệu để dự báo quỹ đạo phát triển nghề nghiệp.";

  if (bestCareer) {
    message = `Theo dữ liệu học tập hiện tại, hướng phát triển nổi bật nhất là ${bestCareer.careerName} với xác suất dự báo khoảng ${bestCareer.probability}%.`;
  }

  return {
    topForecasts: sorted,
    bestCareer,
    secondCareer,
    message,
  };
}
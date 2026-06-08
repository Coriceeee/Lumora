interface MatchExplanationInput {
  careerName: string;
  readinessScore: number;
  strengths: string[];
  weaknesses: string[];
  nextFocus?: string[];
}

export function explainMatch(
  input: MatchExplanationInput
): string[] {
  const {
    careerName,
    readinessScore,
    strengths,
    weaknesses,
    nextFocus = [],
  } = input;

  const reasons: string[] = [];

  reasons.push(
    `Ngành "${careerName}" hiện có mức độ sẵn sàng khoảng ${Math.round(
      readinessScore
    )}%.`
  );

  if (strengths.length > 0) {
    reasons.push(
      `Điểm mạnh nổi bật của bạn là ${strengths.join(", ")}. Đây là những nền tảng quan trọng đối với ngành này.`
    );
  }

  if (weaknesses.length > 0) {
    reasons.push(
      `Bạn vẫn cần cải thiện ${weaknesses.join(
        ", "
      )} để tăng khả năng phát triển trong lĩnh vực này.`
    );
  }

  if (nextFocus.length > 0) {
    reasons.push(
      `Trong thời gian tới, bạn nên ưu tiên tập trung vào ${nextFocus.join(
        ", "
      )}.`
    );
  }

  if (readinessScore >= 85) {
    reasons.push(
      "Bạn đang có nền tảng rất tốt và hoàn toàn có thể phát triển mạnh trong lĩnh vực này."
    );
  } else if (readinessScore >= 70) {
    reasons.push(
      "Bạn có tiềm năng tốt, chỉ cần tiếp tục cải thiện một vài yếu tố quan trọng."
    );
  } else if (readinessScore >= 50) {
    reasons.push(
      "Bạn có nền tảng ban đầu nhưng vẫn còn khoảng cách cần được thu hẹp."
    );
  } else {
    reasons.push(
      "Đây vẫn là một lựa chọn có thể theo đuổi, tuy nhiên bạn sẽ cần một lộ trình phát triển rõ ràng hơn."
    );
  }

  return reasons;
}
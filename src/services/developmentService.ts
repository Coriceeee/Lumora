import { getVireyaDashboards } from "./vireyaDashboardService";
import { getLearningResultsByUser } from "./learningResultService";
import { callGeminiForDashboard } from "./geminiDashboardService";
import { getAllSubjects } from "./subjectService";
import { getAllScoreTypes } from "./scoreTypeService";

// 👉 Prompt riêng được tách ra
const developmentPrompt = (
  normalizedResults: { subjectName: string; score: number; type: string }[],
  dashboards: any[]
): string => {
  return `
🔸 Kết quả học tập:
${normalizedResults.map(r => `- ${r.subjectName}: ${r.score} (${r.type})`).join("\n")}

🔹 Các kế hoạch học tập hiện tại:
${dashboards.map((d: any) => `- ${d.title ?? "(Không có tiêu đề)"}`).join("\n")}

Dựa trên dữ liệu trên, hãy đề xuất định hướng phát triển cho từng môn, bao gồm:
- Trình độ hiện tại (Sơ cấp, Trung cấp, Nâng cao)
- Mục tiêu phát triển chính
- 3-4 chiến lược học tập thực tế

Trả về kết quả dạng JSON:
[
  {
    "subject": "Toán",
    "level": "Trung cấp",
    "goal": "Tăng cường tư duy logic nâng cao",
    "strategies": [
      "Ôn tập chuyên đề hàm số",
      "Tham gia CLB toán học",
      "Làm bài thi thử mỗi tuần"
    ]
  }
]

KHÔNG thêm bất kỳ giải thích hay mô tả nào khác ngoài JSON.
`;
};

export async function getDevelopmentSuggestions() {
  const userId = "user_fake_id_123456"; // ✅ Dùng ID giả cố định

  // Lấy dữ liệu kết quả học tập và kế hoạch học tập
  const [results, dashboards] = await Promise.all([
    getLearningResultsByUser(userId),
    getVireyaDashboards(userId),
  ]);

  const subjects = await getAllSubjects();
  const scoreTypes = await getAllScoreTypes();

  const normalizedResults = results.map(r => {
    const subject = subjects.find(s => s.id === r.subjectId);
    const scoreType = scoreTypes.find(t => t.id === r.scoreTypeId);
    return {
      subjectName: subject?.name ?? "Unknown",
      score: r.score,
      type: scoreType?.name ?? "Unknown",
    };
  });

  // Tạo prompt
  const prompt = developmentPrompt(normalizedResults, dashboards);

  // Gọi Gemini
  const raw = await callGeminiForDashboard(prompt);

  // Parse JSON từ Gemini
  try {
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");
    const cleaned = raw.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Lỗi parse JSON từ Gemini:\n", raw);
    throw new Error("Gemini trả về không phải JSON hợp lệ.");
  }
}

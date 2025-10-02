// src/app/pages/neovana/utils/generateGeminiPrompt.ts

export interface GeminiCareerDashboardResponse {
  targetCareer: string;

  skillsEvaluation: Array<{
    name: string;
    currentScore: number;        // 0–100
    relevance: number;           // 0–100 (mức liên quan tới mục tiêu)
    fitLevel: "Rất phù hợp" | "Phù hợp" | "Trung bình" | "Chưa đạt";
    comment: string;
  }>;

  certificatesEvaluation: Array<{
    name: string;
    has: boolean;
    relevance: number;           // 0–100
    fitLevel: "Rất phù hợp" | "Phù hợp" | "Trung bình" | "Chưa đạt";
    comment: string;
  }>;

  subjectsEvaluation: Array<{
    subjectName: string;
    currentAvg: number;          // 0–100
    relevance: number;           // 0–100
    fitLevel: "Rất phù hợp" | "Phù hợp" | "Trung bình" | "Chưa đạt";
    comment: string;
  }>;

  certificateSuggestions: Array<{
    name: string;
    urgency: "Cao" | "Trung bình" | "Thấp";
    rationale: string;
    recommendedProviders?: string[];
  }>;

  skillSuggestions: Array<{
    name: string;
    urgency: "Cao" | "Trung bình" | "Thấp";
    rationale: string;
  }>;

  subjectSuggestions: Array<{
    name: string;
    urgency: "Cao" | "Trung bình" | "Thấp";
    rationale: string;
  }>;

  radarData: {
    labels: string[];            // hợp nhất trục: ["Kỹ năng:XYZ","Chứng chỉ:ABC","Môn:Toán", ...]
    series: Array<{
      name: "Kỹ năng" | "Chứng chỉ" | "Môn học";
      data: number[];            // 0–100, cùng độ dài với labels
    }>;
    note?: string;               // ghi chú cách tính điểm chuẩn hoá
  };
}

type PromptInput = {
  skills: any;
  certs: any;
  subjects: any;
  selectedCareers: string[];     // từ getCareersInLatestDashboard(userId)
};

export const generateGeminiPrompt = (userData: PromptInput) => {
  const payload = {
    selectedCareer: userData.selectedCareers?.[0] ?? "",
    allSelectedCareers: userData.selectedCareers ?? [],
    skills: userData.skills ?? [],
    certificates: userData.certs ?? [],
    subjects: userData.subjects ?? []
  };

  // Lưu ý: Để tương thích với cách parse trong vireyaDashboardService,
  // ta yêu cầu Gemini trả JSON bên trong code block ```json ... ```
  // và KHÔNG kèm thêm text nào ngoài code block.
  return `
Bạn là chuyên gia định hướng nghề nghiệp. Hãy phân tích dữ liệu người dùng và tạo báo cáo cho mục tiêu nghề nghiệp đã chọn.

DỮ LIỆU NGƯỜI DÙNG (JSON):
${JSON.stringify(payload, null, 2)}

YÊU CẦU PHÂN TÍCH (bắt buộc đủ 7 phần):
1) Đánh giá các KỸ NĂNG hiện có và mức độ đáp ứng cho mục tiêu.
2) Đánh giá các CHỨNG CHỈ hiện có và mức độ đáp ứng cho mục tiêu.
3) Đánh giá điểm các MÔN HỌC hiện có và mức độ đáp ứng cho mục tiêu.
4) Đề xuất CÁC CHỨNG CHỈ CẦN BỔ SUNG: tên, mức độ cấp thiết (Cao/Trung bình/Thấp), kèm rationale ngắn gọn; có thể gợi ý nhà cung cấp.
5) Đề xuất CÁC KỸ NĂNG CẦN BỔ SUNG: tên, mức độ cấp thiết (Cao/Trung bình/Thấp), rationale.
6) Đề xuất CÁC MÔN HỌC CẦN CẢI THIỆN: tên, mức độ cấp thiết (Cao/Trung bình/Thấp), rationale.
7) Tạo RADAR CHART mối quan hệ giữa Kỹ năng – Chứng chỉ – Môn học (chuẩn hoá 0–100). 
   - Hợp nhất nhãn theo dạng: "Kỹ năng:<name>", "Chứng chỉ:<name>", "Môn:<name>"
   - Trả về 3 series: "Kỹ năng", "Chứng chỉ", "Môn học" với mảng data có cùng độ dài với labels.
   - Nếu thiếu dữ liệu, điền 0 thay vì để giá trị rỗng (tránh NaN).

CHỈ TRẢ KẾT QUẢ DƯỚI DẠNG MÃ JSON TRONG CODE BLOCK \`\`\`json ... \`\`\` VÀ TUÂN THEO SCHEMA SAU:

\`\`\`json
{
  "targetCareer": "string",

  "skillsEvaluation": [
    { "name": "string", "currentScore": 0, "relevance": 0, "fitLevel": "Rất phù hợp", "comment": "string" }
  ],

  "certificatesEvaluation": [
    { "name": "string", "has": true, "relevance": 0, "fitLevel": "Phù hợp", "comment": "string" }
  ],

  "subjectsEvaluation": [
    { "subjectName": "string", "currentAvg": 0, "relevance": 0, "fitLevel": "Trung bình", "comment": "string" }
  ],

  "certificateSuggestions": [
    { "name": "string", "urgency": "Cao", "rationale": "string", "recommendedProviders": ["Coursera","Udemy"] }
  ],

  "skillSuggestions": [
    { "name": "string", "urgency": "Trung bình", "rationale": "string" }
  ],

  "subjectSuggestions": [
    { "name": "string", "urgency": "Thấp", "rationale": "string" }
  ],

  "radarData": {
    "labels": ["Kỹ năng:Phân tích", "Chứng chỉ:IELTS", "Môn:Toán"],
    "series": [
      { "name": "Kỹ năng",   "data": [65, 0, 0] },
      { "name": "Chứng chỉ", "data": [0, 80, 0] },
      { "name": "Môn học",   "data": [0, 0, 72] }
    ],
    "note": "Điểm được chuẩn hoá 0–100; chỗ thiếu dữ liệu đặt 0 để tránh NaN."
  }
}
\`\`\`

NGUYÊN TẮC:
- Không thêm giải thích bên ngoài code block.
- Tất cả số liệu phải là số (0–100). Không để trống/undefined/NaN.
- Nếu dữ liệu không đủ, nội suy hợp lý hoặc đặt 0 theo nguyên tắc trên.
`;
};

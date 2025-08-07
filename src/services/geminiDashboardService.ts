const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const API_KEY = "AIzaSyCkCmNGA5DcO_OJ66e4oswZgszlcpBazXE"; // 🔑 Đảm bảo key này không bị lộ public

/**
 * Gọi Gemini với prompt bất kỳ
 */
export const callGeminiForDashboard = async (prompt: string): Promise<string> => {
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API error:", data);
      throw new Error(data.error?.message || "Lỗi không xác định từ Gemini");
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "(Không có phản hồi)";
  } catch (error) {
    console.error("Gemini API exception:", error);
    throw error;
  }
};

/**
 * ✅ Prompt phân tích năng lực học tập (Radar + Line + AI summary)
 */
const geminiLearningAnalysisPrompt = `
Đây là dữ liệu điểm của học sinh theo từng môn qua 3 học kỳ:
- Toán: 8, 9, 7
- Văn: 6, 6, 7
- Anh: 9, 9, 10

Hãy phân tích theo mẫu JSON dưới đây và chỉ TRẢ VỀ JSON THUẦN TÚY (KHÔNG giải thích, KHÔNG markdown, KHÔNG comment):

{
  "subjectInsights": [
    {
      "subjectName": "Toán",
      "trend": "Dao động",
      "strength": "Hiểu nhanh công thức",
      "weakness": "Thiếu ổn định đầu kỳ",
      "suggestion": "Cần luyện đề giữ phong độ"
    }
  ],
  "radarChartData": [
    { "subject": "Toán", "score": 8.0 },
    { "subject": "Văn", "score": 6.3 },
    { "subject": "Anh", "score": 9.3 }
  ],
  "trendChartData": [
    { "name": "HK1", "Toán": 8, "Văn": 6, "Anh": 9 },
    { "name": "HK2", "Toán": 9, "Văn": 6, "Anh": 9 },
    { "name": "HK3", "Toán": 7, "Văn": 7, "Anh": 10 }
  ],
  "overallSummary": "Học sinh có kết quả tốt ở môn Anh và Toán. Môn Văn cần được cải thiện thêm."
}
`;

/**
 * 🔜 Prompt placeholder cho mục khác (bạn sửa nội dung theo nhu cầu)
 */
const geminiOtherPrompt = `
# TODO: Prompt cho mục khác (ví dụ: định hướng phát triển, gợi ý ngành nghề,...)

Bạn hãy phân tích XYZ...
--> Trả về JSON theo mẫu ...
(CHỈ JSON, KHÔNG markdown, KHÔNG lời giải thích)
`;

/**
 * Hàm gọi Gemini để phân tích năng lực học tập
 */
export const getGeminiAnalysis = async () => {
  const responseText = await callGeminiForDashboard(geminiLearningAnalysisPrompt);

  const cleanedText = responseText
    .replace(/```json|```/g, "") // loại bỏ markdown nếu có
    .trim();

  try {
    const parsed = JSON.parse(cleanedText);
    return parsed;
  } catch (e) {
    console.error("❌ Không thể parse JSON từ Gemini:\n", cleanedText);
    throw new Error("Kết quả từ Gemini không phải JSON hợp lệ");
  }
};

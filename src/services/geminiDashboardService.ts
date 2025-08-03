// services/geminiDashboardService.ts
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const API_KEY = "AIzaSyCkCmNGA5DcO_OJ66e4oswZgszlcpBazXE"; // 🔑 Đảm bảo bạn đã thêm key này vào .env

export const callGeminiForDashboard = async (prompt: string) => {
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API error:", data);
      throw new Error(data.error?.message || "Lỗi không xác định");
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "(Không có phản hồi)";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const API_KEY = "AIzaSyAYNlFuG-vxpaEz3_m-jjw-HftDA1H9gps";

if (!API_KEY) {
  throw new Error("❌ Missing Gemini API key. Check your .env.local file.");
}

/**
 * Gọi Gemini API và trả về dữ liệu JSON đã parse.
 * @param prompt - văn bản yêu cầu
 * @param options - cấu hình sinh nội dung (temperature, topP, topK)
 */
export async function callGeminiServer(
  prompt: string,
  options: { temperature?: number } = {}
) {
  const temperature = options.temperature ?? 1.0;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],        
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini server error:", data);
      throw new Error(data.error?.message || "Gemini request failed");
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // 🧹 Loại bỏ dấu ```json / ``` nếu có
    const cleanText = text.replace(/```json|```/g, "").trim();

    // ✅ Trả về đối tượng JSON
    try {
      return JSON.parse(cleanText);
    } catch {
      console.warn("⚠️ Gemini trả về không phải JSON hợp lệ, trả text thô.");
      return { messages: [], raw: cleanText };
    }
  } catch (err) {
    console.error("Gemini lỗi:", err);
    throw err;
  }
}

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const API_KEY = "AIzaSyCkCmNGA5DcO_OJ66e4oswZgszlcpBazXE";
/**
 * Gọi Gemini server-side. Sử dụng biến môi trường GEMINI_API_KEY.
 * Không gọi trực tiếp từ frontend.
 */
export async function callGeminiServer(prompt: string): Promise<any> {
  
  if (!API_KEY) throw new Error("Missing GEMINI_API_KEY in environment");

  const res = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    console.error("Gemini server error:", data);
    throw new Error(data.error?.message || "Gemini error");
  }

const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  // Loại bỏ markdown code block nếu có
  const cleanedText = responseText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("❌ Không thể parse JSON từ Gemini:\n", cleanedText);
    throw new Error("Kết quả từ Gemini không phải JSON hợp lệ");
  }
}

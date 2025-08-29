// src/lib/gemini.ts
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Gọi Gemini server-side. Sử dụng biến môi trường GEMINI_API_KEY.
 * Không gọi trực tiếp từ frontend.
 */
export async function callGeminiServer(prompt: string): Promise<string> {
  const API_KEY = process.env.GEMINI_API_KEY;
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
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 1024,
        candidateCount: 1,
        topP: 0.95,
        topK: 40,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Gemini server error:", data);
    throw new Error(data.error?.message || "Gemini error");
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

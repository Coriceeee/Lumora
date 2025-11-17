const API_GATEWAY_URL =
  "https://lumora-api-t86b.vercel.app/api/gemini";

/**
 * Gọi API Gemini thông qua server Vercel (không lộ API key).
 * @param prompt - văn bản yêu cầu
 * @param options - cấu hình sinh nội dung (temperature, topP, topK)
 */
export async function callGeminiServer(
  prompt: string,
  options: { temperature?: number } = {}
) {
  const temperature = options.temperature ?? 1.0;

  try {
    const res = await fetch(API_GATEWAY_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        prompt,
        temperature,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ API Gateway lỗi:", data);
      throw new Error(data.error || "API request failed");
    }

    // Trả thẳng response từ server
    return data;
  } catch (err) {
    console.error("❌ callGeminiServer FE error:", err);
    throw err;
  }
}

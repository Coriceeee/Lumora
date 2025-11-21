const API_GATEWAY_URL =
  "https://lumora-api-roan.vercel.app/api/gemini";

/**
 * Gọi API Gemini thông qua server Vercel (không lộ API key).
 * @param prompt - văn bản yêu cầu
 * @param options - cấu hình sinh nội dung (temperature, topP, topK)
 */
export async function callGeminiServer(
  prompt: string,  
) {
  
  try {
    const res = await fetch(API_GATEWAY_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
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
      console.error("❌ API Gateway lỗi:", data);
      throw new Error(data.error || "API request failed");
    }

    // Trả thẳng response từ server
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "(Không có phản hồi)";
  } catch (err) {
    console.error("❌ callGeminiServer FE error:", err);
    throw err;
  }
}

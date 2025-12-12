const API_GATEWAY_URL =
  "https://lumora-api-roan.vercel.app/api/gemini";

export async function callGeminiServer(prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000); // 30s

  try {
    const res = await fetch(API_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await res.json().catch(() => null);

    // ❌ HTTP error
    if (!res.ok) {
      // Xử lý RIÊNG 429
      if (res.status === 429) {
        throw new Error(
          "⚠️ Hệ thống AI đang quá tải. Vui lòng chờ vài giây rồi thử lại."
        );
      }

      // Lỗi khác
      throw new Error(
        data?.error?.message ||
          `API error ${res.status}`
      );
    }

    // ✅ Thành công
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "(AI không trả về nội dung)"
    );
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("⏱️ AI phản hồi quá chậm, vui lòng thử lại");
    }

    console.error("❌ callGeminiServer FE error:", err);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

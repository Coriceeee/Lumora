import { openai } from "./openaiConfig"; // bạn cần set up OpenAI SDK

export const callGPTForDashboard = async (results: any[]) => {
  const importantSubjects = ["Toán", "Văn", "Ngoại ngữ", "Tin học"];
  const subjectData: Record<string, any> = {};

  results.forEach((item) => {
    const subject = item.subjectName;
    if (!subjectData[subject]) {
      subjectData[subject] = {};
    }
    subjectData[subject][item.scoreType] = item.score;
  });

  const payload = {
    "Các môn quan trọng": importantSubjects.filter((m) => subjectData[m]),
    ...subjectData,
  };

  const prompt = `
Dưới đây là điểm học tập của học sinh X. Hãy:
1. Phân tích tổng quan học lực
2. Nhận diện ưu điểm và điểm cần cải thiện 
3. Gợi ý chiến lược học tập tổng thể 
4. Đánh giá và gợi ý chiến lược học tập cho các Môn Học Quan Trọng.
5. Phân tích từng môn theo các tiêu chí: xu hướng, điểm mạnh, điểm yếu, chiến lược cải thiện

Dữ liệu điểm số:
${JSON.stringify(payload, null, 2)}

Trả kết quả theo định dạng JSON chuẩn đã thống nhất.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  // Parse JSON từ response
  const raw = response.choices[0].message.content!;
  const parsed = JSON.parse(raw);
  return parsed;
};

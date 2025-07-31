import { openai } from "./openaiConfig";

export const callGPTForDashboard = async (prompt: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 🎯 Chỉ định rõ model ở đây
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("GPT API error:", error);
    throw error;
  }
};

import { OpenAI } from "openai";

// Đảm bảo bạn lưu API key vào biến môi trường
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

export { openai };

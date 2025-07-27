import { OpenAI } from "openai";

// Đảm bảo bạn lưu API key vào biến môi trường
const openai = new OpenAI({
  apiKey: ""
});

export { openai };

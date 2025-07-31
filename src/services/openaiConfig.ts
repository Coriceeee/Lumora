import { OpenAI } from "openai";

// ✅ Dành cho Create React App: chỉ dùng REACT_APP_ prefix
const apiKey = process.env.REACT_APP_OPENAI_API_KEY || "";

if (!apiKey) {
  console.warn("⚠️ REACT_APP_OPENAI_API_KEY is missing.");
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

export { openai };

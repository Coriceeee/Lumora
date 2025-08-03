import { OpenAI } from "openai";

// ✅ Dành cho Create React App: chỉ dùng REACT_APP_ prefix
const apiKey = process.env.REACT_APP_OPENAI_API_KEY || "";

if (!apiKey) {
  console.warn("⚠️ REACT_APP_OPENAI_API_KEY is missing.");
}

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});



export { openai };

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || "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",
  dangerouslyAllowBrowser: true,
});

export { openai };

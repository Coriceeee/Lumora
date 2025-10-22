import React, { useState } from "react";
import { useAyura } from "../AyuraCoreProvider";

export const HealingJournalComponent: React.FC = () => {
  const { analyzeEmotion, generateMaterial } = useAyura();
  const [text, setText] = useState("");
  const [aiReply, setAiReply] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    const emotion = await analyzeEmotion(text);
    generateMaterial("journal");
    setAiReply(`AI: Hôm nay bạn đang cảm thấy ${emotion.label}. Hãy hít sâu và mỉm cười nhé 🌸`);
    setText("");
  };

  return (
    <div className="p-4 border rounded-2xl bg-white/70 shadow-md">
      <h3 className="text-lg font-semibold mb-2">📝 Nhật ký chữa lành</h3>
      <textarea
        className="w-full border rounded-xl p-2 h-28"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Viết vài dòng về cảm xúc của bạn hôm nay..."
      />
      <button
        onClick={handleSubmit}
        className="mt-2 rounded-xl border px-3 py-2 bg-pink-100 hover:bg-pink-200 transition"
      >
        Gửi nhật ký
      </button>
      {aiReply && <p className="mt-3 text-sm italic text-gray-700">{aiReply}</p>}
    </div>
  );
};

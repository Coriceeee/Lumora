import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { Sparkles, Mic, Send } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "./journal.css";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

const introspectiveQuestions = [
  "Bạn đang nghĩ gì về mình hôm nay?",
  "Điều gì khiến bạn cảm thấy bình yên lúc này?",
  "Một điều tốt đẹp nào đã xảy ra với bạn gần đây?",
  "Bạn muốn dành thời gian cho cảm xúc nào nhất hôm nay?",
  "Bạn có điều gì muốn thổ lộ với chính mình không?",
];

const Step1_JournalPage = () => {
  const [entry, setEntry] = useState("");
  const [response, setResponse] = useState("");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const randomQ =
      introspectiveQuestions[
        Math.floor(Math.random() * introspectiveQuestions.length)
      ];
    setQuestion(randomQ);
  }, []);

  const getHealingResponse = async (text: string) => {
    return new Promise<{ reply: string; emotions: string[] }>((resolve) =>
      setTimeout(() => {
        resolve({
          reply:
            "Mình thật sự cảm nhận được bạn dấn bước hôm nay. Mỗi câu chữ bạn chia sẻ là một bước tiến nhẹ nhàng, yên bình 💛",
          emotions: ["Giọt chân thành", "Ánh sáng tĩnh lặng"],
        });
      }, 1400)
    );
  };

  const handleSubmit = async () => {
    if (!entry.trim()) {
      toast.warn("Bạn chưa viết gì cả...");
      return;
    }
    setLoading(true);
    try {
      const res = await getHealingResponse(entry);
      setResponse(res.reply);
      setEmotions(res.emotions);
      toast.success("🌼 Cảm ơn bạn, bài viết đã được lắng nghe.");
    } catch (err) {
      toast.error("Có lỗi xảy ra, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window))
      return;

    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    recognitionRef.current = new (SpeechRecognition as any)();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "vi-VN";

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setEntry((prev) => (prev ? prev + " " + transcript : transcript));
      setRecording(false);
      toast.info("🗣️ Đã nhận giọng nói!");
    };

    recognitionRef.current.onerror = (event: any) => {
      setRecording(false);
      toast.error("❌ Lỗi ghi âm: " + event.error);
    };

    recognitionRef.current.onend = () => {
      setRecording(false);
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Trình duyệt không hỗ trợ ghi âm giọng nói!");
      return;
    }
    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
    } else {
      recognitionRef.current.start();
      setRecording(true);
      toast.info("🎤 Đang ghi âm...");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-journal py-20 px-8 font-sans text-gray-900 flex justify-center relative overflow-hidden">
      <div className="healing-bubble bg-yellow-300 w-14 h-14 left-[12%] top-[30%]" />
      <div className="healing-bubble bg-pink-300 w-10 h-10 left-[65%] top-[50%]" />
      <div className="healing-bubble bg-orange-300 w-12 h-12 left-[82%] top-[20%]" />

      <ToastContainer />

      <motion.div
        className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-12 relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <motion.h1
          className="text-4xl font-playfair mb-8 text-[#7A6851] text-center flex items-center justify-center gap-4 select-none drop-shadow-md"
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Sparkles size={36} className="text-[#C6B591]" />
          Nhật ký chữa lành
        </motion.h1>

        <motion.p
          className="mb-6 text-center text-base text-[#A79F91] italic select-none tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {question}
        </motion.p>

        <motion.textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Cho mình biết bạn đang cảm thấy điều gì hôm nay..."
          className="w-full min-h-[220px] p-8 border border-[#C6B591] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#C6B591] bg-[#FCFAF7] placeholder-[#B4A991] text-lg leading-relaxed resize-none shadow-inner transition duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          spellCheck={true}
        />

        <div className="mt-8 flex items-center justify-between gap-6">
          <motion.button
            type="button"
            onClick={toggleRecording}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center gap-3 py-4 px-7 rounded-full border-2 border-[#C6B591] font-semibold text-[#C6B591] hover:bg-gradient-to-r hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 hover:text-white shadow-lg transition select-none ${
              recording ? "bg-gradient-to-r from-yellow-400 to-yellow-300 text-white" : ""
            }`}
          >
            <Mic size={22} />
            {recording ? "Đang ghi âm..." : "Ghi âm"}
          </motion.button>

          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 bg-gradient-to-r from-[#C6B591] to-[#A78E58] hover:from-[#BFB588] hover:to-[#988C4E] text-white font-semibold py-4 px-8 rounded-full shadow-xl transition select-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send size={22} />
            {loading ? "Đang gửi..." : "🌱 Gửi đi một lời nhẹ"}
          </motion.button>
        </div>

        {response && (
          <motion.div
            className="mt-12 bg-[#FAF5E9] p-8 rounded-3xl border border-[#E3DCC9] select-text shadow-md"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="italic text-[#9C8D6E] text-lg">💬 AYURA với bạn:</p>
            <p className="mt-4 text-xl text-[#7A6851] leading-relaxed">{response}</p>
          </motion.div>
        )}

        {emotions.length > 0 && (
          <motion.div
            className="mt-8 space-y-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-[#9C8D6E] text-lg font-medium">🍯 Nguyên liệu cảm xúc hôm nay:</p>
            <div className="flex flex-wrap gap-4">
              {emotions.map((e, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  className="bg-[#FFF8E7] text-[#A78E58] px-5 py-2 rounded-full font-semibold text-base emotion-floating select-none shadow-sm cursor-default"
                  title={e}
                >
                  🌸 {e}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Step1_JournalPage;

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
    <div className="journal-page">
      <div className="healing-bubble bubble-yellow" />
      <div className="healing-bubble bubble-pink" />
      <div className="healing-bubble bubble-orange" />

      <ToastContainer />

      <motion.div
        className="journal-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <motion.h1
          className="journal-title"
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Sparkles size={36} className="sparkles-icon" />
          Nhật ký chữa lành
        </motion.h1>

        <motion.p
          className="journal-question"
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
          className="journal-textarea"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          spellCheck={true}
        />

        <div className="journal-actions">
          <motion.button
            type="button"
            onClick={toggleRecording}
            whileTap={{ scale: 0.9 }}
            className={`btn-record ${recording ? "recording" : ""}`}
          >
            <Mic size={22} />
            {recording ? "Đang ghi âm..." : "Ghi âm"}
          </motion.button>

          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="btn-submit"
          >
            <Send size={22} />
            {loading ? "Đang gửi..." : "🌱 Gửi đi một lời nhẹ"}
          </motion.button>
        </div>

        {response && (
          <motion.div
            className="journal-response"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="response-label">💬 AYURA với bạn:</p>
            <p className="response-text">{response}</p>
          </motion.div>
        )}

        {emotions.length > 0 && (
          <motion.div
            className="journal-emotions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="emotions-label">🍯 Nguyên liệu cảm xúc hôm nay:</p>
            <div className="emotions-list">
              {emotions.map((e, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  className="emotion-item"
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

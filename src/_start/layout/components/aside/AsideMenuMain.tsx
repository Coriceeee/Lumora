import React, { useEffect, useMemo, useRef, useState } from "react";
import { callGeminiServer } from "../../../../services/gemini";

type MoodType = "normal" | "calming" | "stress" | "lonely";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

const STORAGE_KEY = "healing_right_aside_chat_history";
const THEME_KEY = "healing_right_aside_theme";

function detectMood(text: string): MoodType {
  const t = text.toLowerCase();

  if (
    t.includes("áp lực") ||
    t.includes("stress") ||
    t.includes("mệt") ||
    t.includes("kiệt sức") ||
    t.includes("quá tải") ||
    t.includes("thi") ||
    t.includes("deadline")
  ) {
    return "stress";
  }

  if (
    t.includes("buồn") ||
    t.includes("khóc") ||
    t.includes("trống rỗng") ||
    t.includes("mất động lực") ||
    t.includes("mệt mỏi tinh thần")
  ) {
    return "calming";
  }

  if (
    t.includes("cô đơn") ||
    t.includes("không ai hiểu") ||
    t.includes("một mình") ||
    t.includes("lạc lõng") ||
    t.includes("không có ai")
  ) {
    return "lonely";
  }

  return "normal";
}

function getMoodLabel(mood: MoodType) {
  switch (mood) {
    case "calming":
      return "Xoa dịu";
    case "stress":
      return "Giảm áp lực";
    case "lonely":
      return "Đồng hành";
    default:
      return "Lắng nghe";
  }
}

function getSystemPrompt(mood: MoodType) {
  const base = `
Bạn là trợ lý AI tâm sự chữa lành dành cho học sinh.
Nguyên tắc:
- nói tiếng Việt tự nhiên, ấm áp, nhẹ nhàng
- lắng nghe, đồng cảm, không phán xét
- giúp học sinh gọi tên cảm xúc và đưa ra 1-2 bước nhỏ thực tế
- không giảng đạo lý dài dòng
- không chẩn đoán bệnh
- tránh giọng máy móc
- câu ngắn, dễ hiểu, dễ thở
- không trả lời quá dài, thường 4-8 câu là đủ
- ưu tiên: đồng cảm -> phản chiếu cảm xúc -> 1-2 gợi ý nhỏ -> 1 câu hỏi nhẹ

Nếu người dùng nhắc đến tự hại, muốn chết, muốn biến mất, không muốn sống nữa, hoặc đang không an toàn:
- nói rõ đây là tình huống nghiêm trọng
- khuyên tìm NGAY người lớn tin cậy ở gần: phụ huynh, giáo viên, người thân, cố vấn học đường
- khuyên liên hệ hỗ trợ khẩn cấp/y tế tại địa phương nếu đang có nguy cơ ngay lúc này
- giọng bình tĩnh, rõ ràng, không dài dòng
`;

  const moodPrompt: Record<MoodType, string> = {
    normal: `
Phong cách hiện tại: lắng nghe cân bằng, ấm áp, nhẹ nhàng.
`,
    calming: `
Phong cách hiện tại: xoa dịu.
- nói chậm, mềm, êm
- dùng từ ngữ giúp ổn định cảm xúc
- có thể gợi ý thở chậm, nghỉ ngắn, uống nước, rời màn hình một chút
`,
    stress: `
Phong cách hiện tại: giảm áp lực.
- giúp người dùng gỡ rối từng chút một
- chia vấn đề thành bước rất nhỏ
- ưu tiên cảm giác "mình làm được một chút thôi cũng ổn"
`,
    lonely: `
Phong cách hiện tại: đồng hành.
- nhấn mạnh người dùng không phải chịu đựng một mình
- phản hồi ấm áp hơn một chút
- hỏi nhẹ để người dùng cảm thấy được ở cạnh
`,
  };

  return `${base}\n${moodPrompt[mood]}\nXưng hô là "mình".`;
}

function summarizeHistory(messages: ChatMessage[]) {
  return messages
    .slice(-12)
    .map((m) => `${m.role === "user" ? "Người dùng" : "Trợ lý"}: ${m.content}`)
    .join("\n\n");
}

function buildPrompt(messages: ChatMessage[], mood: MoodType) {
  const history = summarizeHistory(messages);

  return `${getSystemPrompt(mood)}

Dưới đây là đoạn hội thoại gần nhất:
${history}

Hãy trả lời với vai trò Trợ lý, bằng tiếng Việt, đúng mood hiện tại, nhẹ nhàng, tự nhiên, không quá dài.`;
}

export function AsideMenuMain() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    return [
      {
        role: "assistant",
        content:
          "Mình ở đây với bạn 💙\n\nBạn có thể nói bất cứ điều gì, kể cả những điều khó nói nhất.",
        createdAt: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState<MoodType>("normal");
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved ? saved === "dark" : false;
    } catch {
      return false;
    }
  });
  const [isListening, setIsListening] = useState(false);

  // NEW: mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}

    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);

  useEffect(() => {
    const latestUser = [...messages].reverse().find((m) => m.role === "user");
    if (latestUser) {
      setMood(detectMood(latestUser.content));
    }
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, [input]);

  // khóa scroll body khi mở panel trên mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    if (isMobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isMobileOpen]);

  // resize thì nếu lên desktop phải mở panel sẵn
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMood = detectMood(trimmed);

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setMood(nextMood);

    try {
      const prompt = buildPrompt(nextMessages, nextMood);
      const reply = await callGeminiServer(prompt);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            reply?.trim() ||
            "Mình vẫn ở đây với bạn. Bạn muốn kể thêm một chút nữa không?",
          createdAt: Date.now(),
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.message ||
            "Mình đang bị gián đoạn kết nối một chút. Bạn thử gửi lại nhé.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const clearMemory = () => {
    const initial = [
      {
        role: "assistant" as const,
        content:
          "Mình đã dọn lại cuộc trò chuyện rồi. Bây giờ bạn muốn bắt đầu chia sẻ từ đâu?",
        createdAt: Date.now(),
      },
    ];
    setMessages(initial);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt này chưa hỗ trợ nhập giọng nói.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript.trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .healing-chat-root {
          position: relative;
          width: 100%;
          min-width: 0;
        }

        /* nút nổi mobile */
        .healing-mobile-fab {
          position: fixed;
          right: 14px;
          bottom: 18px;
          z-index: 1200;
          border: none;
          border-radius: 999px;
          min-width: 54px;
          height: 54px;
          padding: 0 16px;
          display: none;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 12px 30px rgba(33, 60, 66, 0.18);
          background: linear-gradient(135deg, #9edfc7, #b9ddff);
          color: #294d4b;
          font-weight: 800;
          font-size: 14px;
        }

        .healing-mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 28, 32, 0.36);
          backdrop-filter: blur(4px);
          z-index: 1090;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }

        .healing-mobile-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        .healing-right-panel {
          width: 100%;
          min-width: 0;
          min-height: 100dvh;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          padding: 12px 10px;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at top left, rgba(236, 255, 248, 0.95), transparent 28%),
            radial-gradient(circle at bottom right, rgba(225, 240, 255, 0.9), transparent 30%),
            linear-gradient(180deg, #eef8f3 0%, #e9f4f1 45%, #edf5ff 100%);
        }

        .healing-right-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 10% 8%, rgba(255,255,255,0.28), transparent 18%),
            radial-gradient(circle at 80% 88%, rgba(214, 239, 229, 0.16), transparent 20%);
        }

        .healing-right-head {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 6px 14px;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .healing-right-badge {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: linear-gradient(135deg, #dff3ec, #e6f2ff);
          border: 1px solid rgba(255,255,255,0.78);
          box-shadow: 0 8px 20px rgba(131, 176, 166, 0.10);
          flex-shrink: 0;
        }

        .healing-right-title-wrap {
          min-width: 0;
          flex: 1;
        }

        .healing-right-title {
          font-size: 18px;
          font-weight: 800;
          color: #2f4f4f;
          line-height: 1.2;
        }

        .healing-right-subtitle {
          margin-top: 4px;
          font-size: 12px;
          color: #6f8a86;
          line-height: 1.5;
        }

        .healing-right-top-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .healing-right-icon-btn {
          border: 1px solid rgba(180,210,200,0.35);
          background: rgba(255,255,255,0.58);
          color: #4e6c72;
          border-radius: 14px;
          width: 40px;
          height: 40px;
          cursor: pointer;
          transition: 0.2s ease;
          box-shadow: 0 6px 14px rgba(131, 176, 166, 0.06);
          backdrop-filter: blur(8px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .healing-right-icon-btn:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.72);
        }

        .healing-right-card {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          border-radius: 26px;
          background: rgba(255,255,255,0.65);
          border: 1px solid rgba(200,220,210,0.55);
          box-shadow: 0 10px 28px rgba(120,160,150,0.08);
          overflow: hidden;
          position: relative;
          z-index: 1;
          backdrop-filter: blur(12px);
        }

        .healing-right-top {
          padding: 18px 16px 12px;
          border-bottom: 1px solid rgba(180,210,200,0.20);
          flex-shrink: 0;
        }

        .healing-right-top-row {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .healing-right-small-badge {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          background: linear-gradient(135deg, #dff3ec, #e6f2ff);
          border: 1px solid rgba(255,255,255,0.8);
          flex-shrink: 0;
        }

        .healing-right-card-text {
          min-width: 0;
          flex: 1;
        }

        .healing-right-card-title {
          color: #3d5f5a;
          font-size: 16px;
          font-weight: 800;
          line-height: 1.2;
        }

        .healing-right-card-subtitle {
          color: #819691;
          font-size: 12px;
          margin-top: 3px;
        }

        .healing-right-notice {
          margin-top: 12px;
          padding: 14px;
          border-radius: 18px;
          font-size: 12px;
          line-height: 1.65;
        }

        .healing-right-moods {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .healing-right-mood-btn {
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.18s ease;
          backdrop-filter: blur(8px);
          border: none;
          min-height: 36px;
        }

        .healing-right-mood-btn:hover {
          transform: translateY(-1px);
        }

        .healing-right-messages {
          flex: 1;
          min-height: 140px;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 14px 14px 8px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .healing-right-messages::-webkit-scrollbar {
          width: 6px;
        }

        .healing-right-messages::-webkit-scrollbar-thumb {
          background: rgba(160,190,184,0.34);
          border-radius: 999px;
        }

        .healing-right-row {
          display: flex;
          width: 100%;
        }

        .healing-right-bubble {
          max-width: 88%;
          padding: 12px 14px;
          border-radius: 20px;
          font-size: 14px;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
          box-shadow: 0 6px 16px rgba(120,160,150,0.06);
          backdrop-filter: blur(8px);
        }

        .healing-right-input {
          padding: 12px 14px 10px;
          border-top: 1px solid rgba(180,210,200,0.20);
          flex-shrink: 0;
        }

        .healing-right-textarea {
          width: 100%;
          resize: none;
          border-radius: 18px;
          padding: 14px 15px;
          font-size: 14px;
          line-height: 1.6;
          outline: none;
          margin-bottom: 10px;
          font-family: inherit;
          transition: 0.2s ease;
          backdrop-filter: blur(8px);
          min-height: 92px;
          max-height: 150px;
        }

        .healing-right-textarea::placeholder {
          color: inherit;
          opacity: 0.55;
        }

        .healing-right-textarea:focus {
          box-shadow: 0 0 0 4px rgba(214,239,229,0.28);
        }

        .healing-right-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          width: 100%;
        }

        .healing-right-small-btn {
          border-radius: 14px;
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: 0.18s ease;
          backdrop-filter: blur(8px);
          min-width: 44px;
          min-height: 44px;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .healing-right-small-btn:hover {
          transform: translateY(-1px);
        }

        .healing-right-send-btn {
          flex: 1;
          min-width: 0;
          border: none;
          border-radius: 16px;
          padding: 12px 14px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(120,160,150,0.10);
          transition: 0.18s ease;
          min-height: 44px;
        }

        .healing-right-send-btn:hover {
          transform: translateY(-1px);
        }

        .healing-right-footer {
          padding: 0 14px 14px;
          color: #8ca09c;
          font-size: 11px;
          line-height: 1.6;
          flex-shrink: 0;
        }

        .healing-mobile-close {
          display: none;
        }

        @media (max-width: 768px) {
          .healing-mobile-fab {
            display: inline-flex;
          }

          .healing-right-panel {
            position: fixed;
            top: 0;
            right: 0;
            width: min(100vw, 420px);
            max-width: 100vw;
            min-height: 100dvh;
            height: 100dvh;
            z-index: 1100;
            transform: translateX(100%);
            transition: transform 0.28s ease;
            box-shadow: -12px 0 30px rgba(20, 38, 42, 0.16);
            padding: 10px 8px;
          }

          .healing-right-panel.open {
            transform: translateX(0);
          }

          .healing-right-head {
            padding: 6px 2px 12px;
            gap: 10px;
          }

          .healing-right-badge {
            width: 48px;
            height: 48px;
            border-radius: 16px;
            font-size: 22px;
          }

          .healing-right-title {
            font-size: 16px;
          }

          .healing-right-subtitle {
            font-size: 11px;
            line-height: 1.4;
          }

          .healing-right-icon-btn {
            width: 38px;
            height: 38px;
            border-radius: 12px;
          }

          .healing-right-card {
            border-radius: 22px;
          }

          .healing-right-top {
            padding: 14px 12px 10px;
          }

          .healing-right-small-badge {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }

          .healing-right-card-title {
            font-size: 15px;
          }

          .healing-right-card-subtitle {
            font-size: 11px;
          }

          .healing-right-notice {
            padding: 12px;
            border-radius: 16px;
            font-size: 11px;
            line-height: 1.55;
          }

          .healing-right-moods {
            gap: 6px;
          }

          .healing-right-mood-btn {
            padding: 7px 11px;
            font-size: 11px;
            min-height: 34px;
          }

          .healing-right-messages {
            min-height: 120px;
            padding: 12px 12px 8px;
            gap: 8px;
          }

          .healing-right-bubble {
            max-width: 92%;
            padding: 11px 12px;
            font-size: 13px;
            border-radius: 18px;
          }

          .healing-right-input {
            padding: 10px 12px 8px;
          }

          .healing-right-textarea {
            min-height: 82px;
            padding: 12px 13px;
            border-radius: 16px;
            font-size: 13px;
            margin-bottom: 8px;
          }

          .healing-right-actions {
            gap: 6px;
          }

          .healing-right-small-btn {
            min-width: 40px;
            min-height: 40px;
            border-radius: 12px;
            font-size: 11px;
          }

          .healing-right-send-btn {
            min-height: 40px;
            border-radius: 14px;
            font-size: 13px;
          }

          .healing-right-footer {
            padding: 0 12px 12px;
            font-size: 10px;
            line-height: 1.5;
          }

          .healing-mobile-close {
            display: inline-flex;
          }
        }

        @media (max-width: 480px) {
          .healing-right-panel {
            width: 100vw;
            padding: 8px 6px;
          }

          .healing-right-head {
            gap: 8px;
          }

          .healing-right-badge {
            width: 44px;
            height: 44px;
            font-size: 20px;
          }

          .healing-right-title {
            font-size: 15px;
          }

          .healing-right-subtitle {
            font-size: 10.5px;
          }

          .healing-right-card {
            border-radius: 18px;
          }

          .healing-right-top {
            padding: 12px 10px 8px;
          }

          .healing-right-small-badge {
            width: 36px;
            height: 36px;
            border-radius: 12px;
            font-size: 16px;
          }

          .healing-right-card-title {
            font-size: 14px;
          }

          .healing-right-notice {
            font-size: 10.5px;
            border-radius: 14px;
          }

          .healing-right-mood-btn {
            font-size: 10px;
            padding: 6px 10px;
            min-height: 32px;
          }

          .healing-right-messages {
            min-height: 110px;
            padding: 10px 10px 6px;
          }

          .healing-right-bubble {
            max-width: 95%;
            font-size: 12.5px;
          }

          .healing-right-textarea {
            min-height: 76px;
            font-size: 12.5px;
            border-radius: 14px;
          }

          .healing-right-small-btn {
            width: 40px;
            padding: 0;
          }

          .healing-right-send-btn {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="healing-chat-root">
        {/* Nút nổi chỉ dùng trên mobile */}
        <button
          className="healing-mobile-fab"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Mở góc chữa lành"
          title="Mở góc chữa lành"
        >
          <span>☁️</span>
        </button>

        {/* nền mờ */}
        <div
          className={`healing-mobile-backdrop ${isMobileOpen ? "open" : ""}`}
          onClick={() => setIsMobileOpen(false)}
        />

        <div
          className={`healing-right-panel ${isMobileOpen ? "open" : ""}`}
          style={{
            background: isDark
              ? `
                radial-gradient(circle at top left, rgba(91, 133, 125, 0.18), transparent 28%),
                radial-gradient(circle at bottom right, rgba(96, 120, 170, 0.16), transparent 30%),
                linear-gradient(180deg, #1f2b31 0%, #223238 48%, #243142 100%)
              `
              : `
                radial-gradient(circle at top left, rgba(236, 255, 248, 0.95), transparent 28%),
                radial-gradient(circle at bottom right, rgba(225, 240, 255, 0.9), transparent 30%),
                linear-gradient(180deg, #eef8f3 0%, #e9f4f1 45%, #edf5ff 100%)
              `,
          }}
        >
          <div className="healing-right-head">
            <div className="healing-right-badge">☁️</div>

            <div className="healing-right-title-wrap">
              <div
                className="healing-right-title"
                style={{ color: isDark ? "#e8f4f3" : "#2f4f4f" }}
              >
                Mình ở đây
              </div>
              <div
                className="healing-right-subtitle"
                style={{ color: isDark ? "#b8cbc8" : "#6f8a86" }}
              >
                Một góc nhỏ để bạn thở và được lắng nghe
              </div>
            </div>

            <div className="healing-right-top-actions">
              <button
                className="healing-right-icon-btn"
                onClick={() => setIsDark((v) => !v)}
                title="Đổi giao diện"
              >
                {isDark ? "🌤️" : "🌌"}
              </button>

              <button
                className="healing-right-icon-btn healing-mobile-close"
                onClick={() => setIsMobileOpen(false)}
                title="Đóng"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            className="healing-right-card"
            style={{
              background: isDark
                ? "rgba(27, 39, 46, 0.58)"
                : "rgba(255,255,255,0.62)",
              border: isDark
                ? "1px solid rgba(145, 182, 177, 0.14)"
                : "1px solid rgba(200,220,210,0.42)",
            }}
          >
            <div className="healing-right-top">
              <div className="healing-right-top-row">
                <div className="healing-right-small-badge">🫧</div>

                <div className="healing-right-card-text">
                  <div
                    className="healing-right-card-title"
                    style={{ color: isDark ? "#edf7f5" : "#3d5f5a" }}
                  >
                    Góc chữa lành
                  </div>
                  <div
                    className="healing-right-card-subtitle"
                    style={{ color: isDark ? "#b9cdcb" : "#819691" }}
                  >
                    Chế độ: {getMoodLabel(mood)}
                  </div>
                </div>
              </div>

              <div
                className="healing-right-notice"
                style={{
                  background: theme.noticeBg,
                  color: theme.noticeText,
                  border: theme.noticeBorder,
                }}
              >
                Bạn có thể chia sẻ về áp lực học tập, chuyện gia đình, bạn bè,
                cô đơn hoặc chỉ đơn giản là muốn có ai đó lắng nghe.
              </div>

              <div className="healing-right-moods">
                {(["normal", "calming", "stress", "lonely"] as MoodType[]).map(
                  (item) => (
                    <button
                      key={item}
                      className="healing-right-mood-btn"
                      onClick={() => setMood(item)}
                      style={{
                        background:
                          mood === item
                            ? theme.moodChipActiveBg
                            : theme.moodChipBg,
                        color:
                          mood === item
                            ? theme.moodChipActiveText
                            : theme.moodChipText,
                        border:
                          mood === item
                            ? theme.moodChipActiveBorder
                            : theme.moodChipBorder,
                      }}
                    >
                      {getMoodLabel(item)}
                    </button>
                  )
                )}
              </div>
            </div>

            <div ref={listRef} className="healing-right-messages">
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";

                return (
                  <div
                    key={`${msg.role}-${msg.createdAt}-${index}`}
                    className="healing-right-row"
                    style={{
                      justifyContent: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      className="healing-right-bubble"
                      style={
                        isUser
                          ? {
                              background: theme.userBubbleBg,
                              color: theme.userBubbleText,
                              border: theme.userBubbleBorder,
                              borderTopRightRadius: 6,
                            }
                          : {
                              background: theme.assistantBubbleBg,
                              color: theme.assistantBubbleText,
                              border: theme.assistantBubbleBorder,
                              borderTopLeftRadius: 6,
                            }
                      }
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div
                  className="healing-right-row"
                  style={{ justifyContent: "flex-start" }}
                >
                  <div
                    className="healing-right-bubble"
                    style={{
                      background: theme.assistantBubbleBg,
                      color: theme.assistantBubbleText,
                      border: theme.assistantBubbleBorder,
                      borderTopLeftRadius: 6,
                    }}
                  >
                    Mình đang suy nghĩ cùng bạn...
                  </div>
                </div>
              )}
            </div>

            <div className="healing-right-input">
              <textarea
                ref={textareaRef}
                className="healing-right-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Viết điều bạn muốn tâm sự..."
                rows={3}
                style={{
                  background: theme.textareaBg,
                  color: theme.textareaText,
                  border: theme.textareaBorder,
                }}
              />

              <div className="healing-right-actions">
                <button
                  className="healing-right-small-btn"
                  onClick={toggleVoiceInput}
                  style={{
                    background: isListening
                      ? theme.voiceActiveBg
                      : theme.smallBtnBg,
                    color: isListening
                      ? theme.voiceActiveText
                      : theme.smallBtnText,
                    border: theme.smallBtnBorder,
                  }}
                  title="Nhập bằng giọng nói"
                >
                  {isListening ? "🎙️" : "🎤"}
                </button>

                <button
                  className="healing-right-small-btn"
                  onClick={clearMemory}
                  style={{
                    background: theme.smallBtnBg,
                    color: theme.smallBtnText,
                    border: theme.smallBtnBorder,
                  }}
                  title="Dọn cuộc trò chuyện"
                >
                  🧹
                </button>

                <button
                  className="healing-right-send-btn"
                  onClick={() => void sendMessage()}
                  disabled={!canSend}
                  style={
                    canSend
                      ? {
                          background: theme.sendBtnBg,
                          color: theme.sendBtnText,
                        }
                      : {
                          background: theme.sendBtnDisabledBg,
                          color: theme.sendBtnDisabledText,
                          opacity: 0.72,
                        }
                  }
                >
                  {loading ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </div>

            <div
              className="healing-right-footer"
              style={{ color: isDark ? "#9cb4b0" : "#8ca09c" }}
            >
              Không cần phải giấu đi phần yếu đuối đâu, tớ ở đây là để nghe cả những điều đó.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const lightTheme = {
  noticeBg: "linear-gradient(135deg, #eefaf4, #eef6ff)",
  noticeText: "#58746e",
  noticeBorder: "1px solid rgba(168, 205, 194, 0.55)",

  assistantBubbleBg: "linear-gradient(135deg, #f6fffb, #f2f8ff)",
  assistantBubbleText: "#44635e",
  assistantBubbleBorder: "1px solid rgba(183, 218, 207, 0.52)",

  userBubbleBg: "linear-gradient(135deg, #d8f3e8, #dfeeff)",
  userBubbleText: "#2f5a56",
  userBubbleBorder: "1px solid rgba(164, 205, 193, 0.35)",

  textareaBg: "linear-gradient(135deg, #f7fffb, #f3f9ff)",
  textareaText: "#3f5f5b",
  textareaBorder: "1px solid rgba(176, 213, 202, 0.58)",

  smallBtnBg: "linear-gradient(135deg, #eef8f3, #edf4ff)",
  smallBtnText: "#4e6f6a",
  smallBtnBorder: "1px solid rgba(180,210,200,0.5)",

  voiceActiveBg: "linear-gradient(135deg, #ffdce8, #ffe9f3)",
  voiceActiveText: "#9b4764",

  sendBtnBg: "linear-gradient(135deg, #9edfc7, #b9ddff)",
  sendBtnText: "#294d4b",
  sendBtnDisabledBg: "#dfeae6",
  sendBtnDisabledText: "#8ea09b",

  moodChipBg: "linear-gradient(135deg, #f1f8f4, #eef4ff)",
  moodChipText: "#5f7c78",
  moodChipBorder: "1px solid rgba(180,210,200,0.5)",
  moodChipActiveBg: "linear-gradient(135deg, #cdeee1, #d8e8ff)",
  moodChipActiveText: "#355c5a",
  moodChipActiveBorder: "1px solid rgba(160,200,190,0.6)",
};

const darkTheme = {
  noticeBg:
    "linear-gradient(135deg, rgba(60, 88, 88, 0.55), rgba(59, 74, 102, 0.48))",
  noticeText: "#d4e8e4",
  noticeBorder: "1px solid rgba(151, 198, 191, 0.18)",

  assistantBubbleBg:
    "linear-gradient(135deg, rgba(63, 85, 84, 0.72), rgba(55, 73, 94, 0.72))",
  assistantBubbleText: "#edf7f5",
  assistantBubbleBorder: "1px solid rgba(157, 205, 194, 0.14)",

  userBubbleBg: "linear-gradient(135deg, #467b73, #4e7094)",
  userBubbleText: "#f4fdff",
  userBubbleBorder: "1px solid rgba(138, 203, 192, 0.18)",

  textareaBg:
    "linear-gradient(135deg, rgba(30, 44, 50, 0.96), rgba(34, 42, 60, 0.96))",
  textareaText: "#e3eef3",
  textareaBorder: "1px solid rgba(167, 205, 198, 0.14)",

  smallBtnBg:
    "linear-gradient(135deg, rgba(66, 86, 84, 0.72), rgba(58, 71, 96, 0.72))",
  smallBtnText: "#d8e8e6",
  smallBtnBorder: "1px solid rgba(173, 211, 203, 0.12)",

  voiceActiveBg: "linear-gradient(135deg, #7d4662, #91567b)",
  voiceActiveText: "#ffe4ef",

  sendBtnBg: "linear-gradient(135deg, #5da596, #6f8fc0)",
  sendBtnText: "#f5fdff",
  sendBtnDisabledBg: "#3a4653",
  sendBtnDisabledText: "#95a3b2",

  moodChipBg:
    "linear-gradient(135deg, rgba(66, 86, 84, 0.65), rgba(58, 71, 96, 0.65))",
  moodChipText: "#d0e0df",
  moodChipBorder: "1px solid rgba(173, 211, 203, 0.10)",
  moodChipActiveBg: "linear-gradient(135deg, #4e847d, #607fa8)",
  moodChipActiveText: "#f0fcff",
  moodChipActiveBorder: "1px solid rgba(132,187,178,0.20)",
};
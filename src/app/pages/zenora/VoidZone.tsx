import React, { useEffect, useState, useRef } from "react";
import { motion } from "../../../utils/fakeMotion";
import styled, { keyframes } from "styled-components";
import { Box, Typography, Select, MenuItem, Button as MuiButton } from "@mui/material";
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  equalTo,
  get,
  update,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { callGeminiServer } from "../../../services/gemini";
import { v4 as uuid } from "uuid";
import { ZenoraVoiceChat } from "./ZenoraVoiceChat";
<ZenoraVoiceChat />

/* ---------------- Animations ---------------- */
const swirl = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const glow = keyframes`
  from { opacity: 0.4; transform: scale(1); }
  to { opacity: 0.7; transform: scale(1.1); }
`;

/* ---------------- Styled Components ---------------- */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: radial-gradient(circle, #11002b, #000);
  overflow: hidden;
  position: relative;
  padding: 1rem;
  color: white;

  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 2rem;
  }
`;

const BlackholeWrapper = styled.div`
  position: relative;
  width: 600px;
  height: 500px;
  border-radius: 5%;
  box-shadow: 0 0 80px rgba(0, 0, 0, 0.9);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
    border-radius: 50%;
    animation: ${swirl} 5s linear infinite;
  }

  &::after {
    content: "";
    position: absolute;
    width: 120%;
    height: 120%;
    top: -10%;
    left: -10%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
    border-radius: 50%;
    animation: ${glow} 2s infinite alternate ease-in-out;
  }

  video {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 100%;
    min-height: 100%;
    object-fit: cover;
    border-radius: 5px;
  }
`;

const UserStressItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 360px;
  width: 100%;
  flex-shrink: 0;
`;

const UserStressItem = styled.div`
  background-color: #facc15;
  color: black;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  cursor: grab;
  font-weight: 600;
  user-select: none;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const InputWrapper = styled.div`
  background-color: #1f2937;
  padding: 1rem;
  border-radius: 1rem;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 0.375rem;
  background-color: #374151;
  color: white;
  border: none;
  outline: none;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.5rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background-color: #1e40af;
  }
`;

const ChatBox = styled.div`
  background-color: #1f2937;
  padding: 1rem;
  border-radius: 1rem;
  margin-top: 1rem;
  height: 320px;
  overflow-y: auto;
`;

const ChatMessage = styled.div<{ $isUser: boolean }>`
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  text-align: ${(p) => (p.$isUser ? "right" : "left")};
  color: ${(p) => (p.$isUser ? "#93c5fd" : "#34d399")};
`;

const RobotIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
    <path d="M7 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    <path d="M12 2c-2.21 0-4 1.79-4 4v1H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2v1H10V6c0-1.1.9-2 2-2zM7 14v-4h10v4H7z" />
  </svg>
);

/* ---------------- Main Component ---------------- */
const VoidZone: React.FC = () => {
  const [input, setInput] = useState("");
  const [userStressItems, setUserStressItems] = useState<{ id: string; text: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "system",
      content: "Bạn đang ở VoidZone – nơi lắng nghe và chia sẻ những căng thẳng của bạn.",
    },
  ]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  const [chatLoading, setChatLoading] = useState(false);
  const deletedItemsRef = useRef<Set<string>>(new Set());

  const auth = getAuth();
  const user = auth.currentUser;

  const blackholeRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  /* ---------------- Drag System ---------------- */
  const dragRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const startDrag = (e: React.MouseEvent, id: string) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    dragRef.current = {
      id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };

    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", endDrag);
  };

  const onDragMove = (e: MouseEvent) => {
    if (!dragRef.current) return;

    const item = document.getElementById(dragRef.current.id);
    if (!item) return;

    item.style.position = "fixed";
    item.style.left = e.clientX - dragRef.current.offsetX + "px";
    item.style.top = e.clientY - dragRef.current.offsetY + "px";
    item.style.zIndex = "999";

    handleHoverIntoBlackhole(e, dragRef.current.id);
  };

  const endDrag = () => {
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", endDrag);

    dragRef.current = null;
  };

  /* ---------------- Points ---------------- */
  const updatePoint = async (score: number) => {
    if (!user) return;
    const db = getDatabase();
    const pointRef = ref(db, `pointItems`);
    const q = query(pointRef, orderByChild("userId"), equalTo(user.uid));
    const snap = await get(q);
    if (!snap.exists()) return;

    const data = snap.val();
    const id = Object.keys(data)[0];
    const userData = Object.values(data)[0] as any;

    await update(ref(db, `pointItems/${id}`), { points: userData.points + score });
  };

  /* ---------------- BlackHole HitTest ---------------- */
  const pointInsideBlackhole = (x: number, y: number) => {
    const el = blackholeRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  /* ---------------- Handle Dropped Stress Item ---------------- */
  const handleHoverIntoBlackhole = async (event: MouseEvent, id: string) => {
    const x = event.clientX;
    const y = event.clientY;

    if (!pointInsideBlackhole(x, y)) return;
    if (deletedItemsRef.current.has(id)) return;

    deletedItemsRef.current.add(id);

    // Lấy nội dung stress
    const item = userStressItems.find((i) => i.id === id);
    const stressText = item?.text || "";

useEffect(() => {
  const synth = window.speechSynthesis;
  const loadVoices = () => {
    const viVoices = synth.getVoices().filter(v => v.lang.startsWith("vi"));
    setVoices(viVoices);
    if (viVoices.length > 0) setSelectedVoice(viVoices[0].name);
  };
  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }
}, []);

const startListening = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "vi-VN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognitionRef.current = recognition;

  recognition.onresult = async (event: any) => {
    const spokenText = event.results[0][0].transcript;
    setTranscript(spokenText);
    setIsListening(false);

    const reply = await callGeminiServer(spokenText);
    setResponse(reply);
    speak(reply);
  };

  recognition.onerror = (event: any) => {
    console.error("Lỗi nhận dạng giọng nói:", event.error);
    setIsListening(false);
  };

  recognition.onend = () => setIsListening(false);

  recognition.start();
  setIsListening(true);
};

const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = voices.find(v => v.name === selectedVoice);
  if (voice) utterance.voice = voice;
  utterance.lang = "vi-VN";
  window.speechSynthesis.speak(utterance);
};

    // Xóa item khỏi UI
    setUserStressItems((prev) => prev.filter((i) => i.id !== id));

    // Trừ điểm
    updatePoint(-1);

    // Prompt tạo lời nhắn theo ngữ cảnh kiểu “vừa vứt bỏ…”
    const prompt = `
Bạn là ZenBot – trợ lý cảm xúc tiếng Việt.
Nhiệm vụ của bạn: tạo một lời nhắn ngắn (1–2 câu) theo cấu trúc:

• Câu phải mang tinh thần “bạn vừa vứt bỏ…” hoặc “mình thấy bạn đã thả ra…”
• Nội dung bám sát cảm xúc mà người dùng vừa ném vào hố đen.
• Giọng điệu nhẹ nhàng, ấm áp, không phân tích sâu, không giảng giải.

Nội dung họ vừa vứt bỏ:
"${stressText}"

Hãy viết lời nhắn mới.
    `;

    try {
      const reply = await callGeminiServer(prompt);

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply.trim(),
        },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- Chat System ---------------- */
  const handleAddMessage = async () => {
    if (!input.trim()) return;

    const text = input.trim();
    const id = uuid();

    setUserStressItems((prev) => [...prev, { id, text }]);
    const newMsgs = [...chatMessages, { role: "user", content: text }];
    setChatMessages(newMsgs);

    setInput("");
    setChatLoading(true);

    try {
      const history = newMsgs
        .map((m) =>
          m.role === "user"
            ? `User: ${m.content}`
            : m.role === "assistant"
            ? `ZenBot: ${m.content}`
            : ""
        )
        .filter(Boolean)
        .join("\n");

      const prompt = `
Bạn là ZenBot – AI trị liệu cảm xúc mặc định bạn sẽ là tiếng việt.
Hãy phản hồi thật nhẹ nhàng, đồng cảm, không dạy đời.
Chỉ viết 2–3 câu.
Bạn có vai trò là người bạn vô hình, luôn lắng nghe và chia sẻ những căng thẳng của người dùng.
Hãy thể hiện sự thấu hiểu và hỗ trợ qua từng câu trả lời.
Nhắc tới đúng nội dung sau và chữa lành nó:
${history}

Tạo câu trả lời tiếp theo:
`;

      const reply = await callGeminiServer(prompt);

      setChatMessages((prev) => [...prev, { role: "assistant", content: reply.trim() }]);
    } catch (err) {
      console.log(err);
    }

    setChatLoading(false);
  };

  useEffect(() => {
    const synth = window.speechSynthesis;
    const update = () => setVoices(synth.getVoices() || []);
    update();
    synth.addEventListener?.("voiceschanged", update);
    return () => synth.removeEventListener?.("voiceschanged", update);
  }, []);

  function startListening(): void {
    setIsListening(true);
    setTranscript("Simulating listening...");
    // In a real application, you would integrate with a speech-to-text API here.
    // For this example, we'll just simulate a response after a delay.
    setTimeout(() => {
      setIsListening(false);
      setResponse("This is a simulated response from ZenBot.");
      setTranscript("");
    }, 3000);
  }

  return (
    <Container>
      {/* Blackhole */}
      <BlackholeWrapper ref={blackholeRef}>
        <div style={{ width: "100%", height: "100%" }}>
          <motion.div
            style={{ width: "100%", height: "100%" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
          >
            <video autoPlay muted loop playsInline>
              <source src="/BlackHold.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </div>
      </BlackholeWrapper>

      {/* Right Panel */}
      
      <UserStressItemsWrapper>
        {userStressItems.map((item) => (
          <UserStressItem
            key={item.id}
            id={item.id}
            onMouseDown={(e) => startDrag(e, item.id)}
          >
            {item.text}
          </UserStressItem>
        ))}

        <InputWrapper>
          <TextInput
            value={input}
            placeholder="Nhập cảm xúc hoặc câu hỏi..."
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={handleAddMessage}>Gửi qua ZenBot</Button>
        </InputWrapper>
        {/* 🎙️ Voice Chat với Zenora */}
        <Box mt={3} sx={{ background: "#111827", borderRadius: "1rem", padding: "1rem" }}>
          <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
            🧠 Tâm sự bằng giọng nói
          </Typography>

          <Select
            value={selectedVoice}
            onChange={(e: any) => setSelectedVoice(e.target.value)}
            sx={{ mb: 2, minWidth: 200, background: "#1f2937", color: "white" }}
          >
            {voices.map((v, i) => (
              <MenuItem key={i} value={v.name}>
                {v.name.includes("Female") || v.name.includes("Nữ") ? "👩 Giọng nữ" : "👨 Giọng nam"} - {v.name}
              </MenuItem>
            ))}
          </Select>

          <MuiButton onClick={startListening} disabled={isListening}>
            {isListening ? "🎧 Đang nghe bạn nói..." : "🎙 Bắt đầu tâm sự"}
          </MuiButton>

          {transcript && (
            <Typography sx={{ color: "#cbd5e1", mt: 2 }}>📥 Bạn nói: {transcript}</Typography>
          )}

          {response && (
            <Typography sx={{ color: "#38bdf8", mt: 1 }}>🤖 ZenBot: {response}</Typography>
          )}
        </Box>

        <ChatBox>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RobotIcon size={24} /> ZenBot – Người bạn vô hình
          </h3>

          {chatMessages.slice(1).map((msg, idx) => (
            <ChatMessage key={idx} $isUser={msg.role === "user"}>
              {msg.role === "user" ? "Bạn" : "ZenBot"}: {msg.content}
            </ChatMessage>
          ))}

          {chatLoading && (
            <div style={{ color: "#aaa", fontStyle: "italic" }}>
              ZenBot đang suy nghĩ…
            </div>
          )}
        </ChatBox>
      </UserStressItemsWrapper>
    </Container>
  );
};

export default VoidZone;

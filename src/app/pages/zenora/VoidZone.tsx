import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "../../../utils/fakeMotion";
import styled, { keyframes } from "styled-components";
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

/* ❗ MUST BE A REAL DOM ELEMENT → styled.div */
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

  /* Ngăn việc bị đẩy */
  flex-shrink: 0;
`;


const UserStressItem = styled(motion.div)`
  background-color: #facc15;
  color: black;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  cursor: grab;
  font-weight: 600;
  user-select: none;
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

  /* Giữ nguyên kích thước – không đẩy UserStressItems */
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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    width={size}
    height={size}
  >
    <path d="M7 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    <path d="M12 2c-2.21 0-4 1.79-4 4v1H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2v1H10V6c0-1.1.9-2 2-2zM7 14v-4h10v4H7z" />
  </svg>
);

/* ---------------- Main Component ---------------- */
const VoidZone: React.FC = () => {
  const [input, setInput] = useState("");
  const [userStressItems, setUserStressItems] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "system",
      content: "Bạn đang ở VoidZone – nơi lắng nghe và chia sẻ những căng thẳng của bạn.",
    },
  ]);

  const [chatLoading, setChatLoading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  const blackholeRef = useRef<HTMLDivElement | null>(null);

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

    await update(ref(db, `pointItems/${id}`), {
      points: userData.points + score,
    });
  };

  /* ---------------- ZenBot Comfort ---------------- */
  const addZenBotComfortMessage = () => {
    const msg =
      "Mình cảm nhận được bạn vừa bỏ đi một điều làm bạn nặng lòng. Hy vọng bạn thấy nhẹ hơn một chút. Mình luôn ở đây với bạn, và nếu muốn, bạn có thể tiếp tục thả mọi thứ vào hố đen nhé.";
    setChatMessages((prev) => [...prev, { role: "assistant", content: msg }]);
  };

  /* ---------------- Collision Detection ---------------- */
  const pointInsideBlackhole = (x: number, y: number) => {
    const el = blackholeRef.current;
    if (!el) return false;

    const rect = el.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  /* ---------------- Hover-to-Delete ---------------- */
const deletedItemsRef = useRef<Set<string>>(new Set());
 const handleHoverIntoBlackhole = (event: MouseEvent, item: string) => {
  const x = event.clientX;
  const y = event.clientY;

  if (!pointInsideBlackhole(x, y)) return;

  // Nếu item đã bị xoá rồi → block
  if (deletedItemsRef.current.has(item)) return;

  // Đánh dấu đã xoá
  deletedItemsRef.current.add(item);

  // Xóa khỏi giao diện
  setUserStressItems((prev) => prev.filter((i) => i !== item));

  // Update điểm
  updatePoint(-1);

  // Chỉ chạy 1 lần duy nhất
  addZenBotComfortMessage();
};

  /* ---------------- Manual Chat ---------------- */
  const handleAddMessage = async () => {
    if (!input.trim()) return;

    setUserStressItems((prev) => [...prev, input]);

    const newMsgs = [...chatMessages, { role: "user", content: input }];
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
Bạn là ZenBot – AI trị liệu cảm xúc.
Phong cách:
- Nhẹ nhàng như một người bạn
- Không phân tích lý trí
- Không dạy đời
- Không markdown
- 2–4 câu
- Câu cuối là 1 câu hỏi mở

${history}

Tạo câu trả lời tiếp theo:
`;

      const reply = await callGeminiServer(prompt);

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply.trim() },
      ]);
    } catch (err) {
      console.log(err);
    }

    setChatLoading(false);
  };

  return (
    <Container>
      {/* Blackhole */}
      <BlackholeWrapper ref={blackholeRef}>
        {/* ⭐ DIV TRUNG GIAN — FIX ResizeObserver 100% */}
        <div style={{ width: "100%", height: "100%" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            style={{ width: "100%", height: "100%" }}
          >
            <video autoPlay muted loop playsInline>
              <source src="/BlackHold.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </div>
      </BlackholeWrapper>

      {/* Right Panel */}
      <UserStressItemsWrapper>
        <AnimatePresence>
          {userStressItems.map((item, idx) => (
            <UserStressItem
              key={item + "_" + idx}
              drag
              onDragMove={(e: MouseEvent) => handleHoverIntoBlackhole(e, item)}
              whileHover={{ scale: 1.1 }}
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: 8 }}
              transition={{ duration: 0.25 }}
            >
              {item}
            </UserStressItem>
          ))}
        </AnimatePresence>

        {/* Input */}
        <InputWrapper>
          <TextInput
            value={input}
            placeholder="Nhập cảm xúc hoặc câu hỏi..."
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={handleAddMessage}>Gửi qua ZenBot</Button>
        </InputWrapper>

        {/* Chat */}
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

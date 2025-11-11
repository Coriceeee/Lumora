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
import { PanInfo } from "framer-motion";

/* ---------------- Animations ---------------- */
const swirl = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const glow = keyframes`
  from { opacity: 0.4; transform: scale(1); }
  to { opacity: 0.7; transform: scale(1.1); }
`;
const shake = keyframes`
  from { transform: rotate(-3deg); }
  to { transform: rotate(3deg); }
`;

/* ---------------- Styled Components ---------------- */
/*
  NOTE: cast motion.div as any to avoid styled-components<->framer-motion
  type incompatibilities in some TypeScript setups. If your project
  types are configured to accept this, you can remove the `as any` casts.
*/
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

const StressItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/* cast motion.div as any to avoid type issues */
const StressItem = styled(motion.div as any)`
  background: linear-gradient(45deg, #ff85a2, #ff6188);
  color: white;
  padding: 14px 28px;
  border-radius: 30px;
  cursor: grab;
  font-weight: bold;
  font-size: 20px;
  box-shadow: 0 5px 15px rgba(255, 75, 43, 0.6);
  user-select: none;
  &:hover {
    animation: ${shake} 0.2s infinite alternate ease-in-out;
  }
`;

const BlackholeWrapper = styled(motion.div as any)`
  position: relative;
  width: 400px;
  height: 400px;
  border-radius: 50%;
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
    border-radius: 25px;
  }
`;

const UserStressItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 360px;
  width: 100%;
`;

const UserStressItem = styled(motion.div as any)`
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
  max-height: 300px;
  overflow-y: auto;
`;

const ChatMessage = styled.div<{ isUser: boolean }>`
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  text-align: ${(p) => (p.isUser ? "right" : "left")};
  color: ${(p) => (p.isUser ? "#93c5fd" : "#34d399")};
`;

/* ---------------- Icons ---------------- */
const SpinnerIcon = ({ size = 40 }: { size?: number }) => (
  <svg
    className="animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={size}
    height={size}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const RobotIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    style={{ flexShrink: 0 }}
  >
    <path d="M7 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    <path d="M12 2c-2.21 0-4 1.79-4 4v1H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2v1H10V6c0-1.1.9-2 2-2zM7 14v-4h10v4H7z" />
  </svg>
);

/* ---------------- Main Component ---------------- */
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY; 
const VoidZone: React.FC = () => {
  const [input, setInput] = useState("");
  const [userStressItems, setUserStressItems] = useState<string[]>([]);
  const [firebaseStressItems, setFirebaseStressItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "system",
      content:
        "Bạn đang ở VoidZone – nơi lắng nghe và chia sẻ những căng thẳng của bạn.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);

  const auth = getAuth();
  const user = auth.currentUser;

  /* ---------- Firebase Fetch ---------- */
  useEffect(() => {
    if (!user) return;
    const fetchStressItems = async () => {
      const db = getDatabase();
      const stressRef = ref(db, "stressItems");
      const q = query(stressRef, orderByChild("createdBy"), equalTo(user.uid));
      try {
        const snapshot = await get(q);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setFirebaseStressItems(
            Object.keys(data).map((key) => ({ id: key, ...data[key] }))
          );
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStressItems();
  }, [user]);

  const updatePoint = async (score: number) => {
    if (!user) return;
    const db = getDatabase();
    const pointRef = ref(db, `pointItems`);
    const q = query(pointRef, orderByChild("userId"), equalTo(user.uid));
    const snap = await get(q);
    if (snap.exists()) {
      const data = snap.val();
      const id = Object.keys(data)[0];
      const userData = Object.values(data)[0] as any;
      const refToUpdate = ref(db, `pointItems/${id}`);
      await update(refToUpdate, { points: userData.points + score });
    }
  };

  const handleDrop = async () => {
    if (!draggingItem) return;
    setFirebaseStressItems((items) =>
      items.filter((item) => item.title !== draggingItem)
    );
    setUserStressItems((items) =>
      items.filter((item) => item !== draggingItem)
    );
    await updatePoint(-1);
    setDraggingItem(null);
  };

  /* ---------- Chat ---------- */
  const handleAddMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...chatMessages, { role: "user", content: input }];
    setChatMessages(newMessages);
    setUserStressItems((prev) => [...prev, input]);
    setInput("");
    setChatLoading(true);

    try {
      const promptText = newMessages
        .map((m) =>
          m.role === "user"
            ? `Bạn: ${m.content}`
            : m.role === "assistant"
            ? `ZenBot: ${m.content}`
            : ""
        )
        .filter(Boolean)
        .join("\n");

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={AIzaSyCR0Fa1XOG2kyP5bC64Sj6wcDiQnt7yUaI}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: {
              messages: [{ content: [{ text: promptText }], role: "user" }],
            },
          }),
        }
      );

      const data = await res.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Mình chưa nghĩ ra câu trả lời...";
      setChatMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: "Có lỗi xảy ra, hãy thử lại nhé!" },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  /* ---------- Render ---------- */
  return (
    <Container>
      <StressItemsWrapper>
        {loading ? (
          <SpinnerIcon size={40} />
        ) : (
          firebaseStressItems.map((item) => (
            <StressItem
              key={item.id}
              drag
              dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
              onDragStart={(
                _event: MouseEvent | TouchEvent | PointerEvent,
                _info: PanInfo
              ) => setDraggingItem(item.title)}
              whileHover={{ scale: 1.2 }}
            >
              {item.title}
            </StressItem>
          ))
        )}
      </StressItemsWrapper>

      <BlackholeWrapper
        onDrop={(e: { preventDefault: () => void }) => {
          e.preventDefault();
          handleDrop();
        }}
        onDragOver={(e: { preventDefault: () => any }) => e.preventDefault()}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <video autoPlay loop muted playsInline>
          <source src="/BlackHold.mp4" type="video/mp4" />
        </video>
      </BlackholeWrapper>

      <UserStressItemsWrapper>
        {userStressItems.map((item) => (
          <UserStressItem
            key={item}
            drag
            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            onDragStart={(
              _event: MouseEvent | TouchEvent | PointerEvent,
              _info: PanInfo
            ) => setDraggingItem(item)}
            whileHover={{ scale: 1.1 }}
          >
            {item}
          </UserStressItem>
        ))}

        <InputWrapper>
          <TextInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập cảm xúc hoặc câu hỏi..."
          />
          <Button onClick={handleAddMessage}>Gửi đến ZenBot</Button>
        </InputWrapper>

        <ChatBox>
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <RobotIcon size={24} /> ZenBot – Người bạn vô hình
          </h3>
          {chatMessages.slice(1).map((msg, idx) => (
            <ChatMessage key={idx} isUser={msg.role === "user"}>
              {msg.role === "user" ? "Bạn" : "ZenBot"}: {msg.content}
            </ChatMessage>
          ))}
          {chatLoading && (
            <div style={{ fontStyle: "italic", color: "#9ca3af" }}>
              ZenBot đang suy nghĩ...
            </div>
          )}
        </ChatBox>
      </UserStressItemsWrapper>
    </Container>
  );
};

export default VoidZone;

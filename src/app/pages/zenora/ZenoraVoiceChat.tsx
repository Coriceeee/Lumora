// FILE: ZenoraVoiceChat.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { callGeminiServer } from "../../../services/gemini";

type Gender = "female" | "male";
type Emotion = "sad" | "neutral" | "positive";

export const ZenoraVoiceChat: React.FC = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [gender, setGender] = useState<Gender>("female");

  const recognitionRef = useRef<any>(null);
  const isStoppingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const callSoundRef = useRef<HTMLAudioElement | null>(null);

  /* ---------------- LOAD VOICES + SOUND ---------------- */
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    callSoundRef.current = new Audio("/sounds/end-call-120633.mp3");
  }, []);

  /* ---------------- START CALL ---------------- */
  const startCall = async () => {
    isStoppingRef.current = false;
    setIsCalling(true);

    try {
      await callSoundRef.current?.play();
    } catch {}

    setTimeout(() => {
      startListening();
    }, 1200);
  };

  /* ---------------- END CALL ---------------- */
  const endCall = () => {
    isStoppingRef.current = true;
    setIsCalling(false);

    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
  };

  /* ---------------- LISTEN LOOP ---------------- */
  const startListening = () => {
    if (isStoppingRef.current || isSpeakingRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onresult = async (event: any) => {
      const userText = event.results[0][0].transcript;

      recognition.stop(); // 🔇 dừng nghe khi Zenora chuẩn bị nói
      const emotion = detectEmotion(userText);

      const reply = await callGeminiServer(userText);
      speak(reply, emotion);

      const wait = estimateSpeakTime(reply);
      setTimeout(() => {
        if (!isStoppingRef.current) startListening();
      }, wait);
    };

    recognition.onerror = () => {
      if (!isStoppingRef.current) startListening();
    };

    recognition.start();
  };

  /* ---------------- EMOTION DETECT (SIMPLE) ---------------- */
  const detectEmotion = (text: string): Emotion => {
    const t = text.toLowerCase();
    if (
      t.includes("buồn") ||
      t.includes("mệt") ||
      t.includes("áp lực") ||
      t.includes("chán")
    )
      return "sad";
    if (t.includes("vui") || t.includes("ổn") || t.includes("tốt"))
      return "positive";
    return "neutral";
  };

  /* ---------------- SPEAK (WEB SPEECH – FREE) ---------------- */
  const speak = (text: string, emotion: Emotion) => {
    isSpeakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";

    // 🎧 GIỌNG MỀM – CHỮA LÀNH
    utterance.rate =
      emotion === "sad" ? 0.85 : emotion === "positive" ? 0.95 : 0.9;

    utterance.pitch =
      gender === "female"
        ? emotion === "sad"
          ? 1.15
          : 1.2
        : emotion === "sad"
        ? 0.8
        : 0.9;

    const voices = voicesRef.current;

    // ƯU TIÊN VOICE VIỆT / GOOGLE
    const voice =
      voices.find(v => v.lang === "vi-VN") ||
      voices.find(v => v.lang.startsWith("vi")) ||
      voices.find(v => v.name.toLowerCase().includes("google"));

    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  /* ---------------- ESTIMATE SPEAK TIME ---------------- */
  const estimateSpeakTime = (text: string) => {
    const words = text.split(" ").length;
    return Math.max(2500, words * 420); // ms
  };

  /* ---------------- UI ---------------- */
  return (
    <Box textAlign="center">
      <Typography variant="h5" gutterBottom>
        📞 Gọi Zenora
      </Typography>

      <ToggleButtonGroup
        exclusive
        value={gender}
        onChange={(_, v) => v && setGender(v)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="female">👩 Giọng nữ</ToggleButton>
        <ToggleButton value="male">👨 Giọng nam</ToggleButton>
      </ToggleButtonGroup>

      {!isCalling ? (
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={startCall}
        >
          ▶️ Bắt đầu gọi
        </Button>
      ) : (
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={endCall}
        >
          ⛔ Kết thúc cuộc gọi
        </Button>
      )}

      <Typography mt={3} color="text.secondary">
        {isCalling
          ? "Zenora đang lắng nghe bạn..."
          : "Nhấn để bắt đầu trò chuyện"}
      </Typography>
    </Box>
  );
};

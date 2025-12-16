""// FILE: ZenoraVoiceChat.tsx
import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Typography, MenuItem, Select } from "@mui/material";
import { callGeminiServer } from "../../../services/gemini";
export const ZenoraVoiceChat: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  const recognitionRef = useRef<any>(null);

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
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        🧠 Tâm sự với Zenora bằng giọng nói
      </Typography>

      <Select
        value={selectedVoice}
        onChange={(e) => setSelectedVoice(e.target.value)}
        sx={{ mb: 2 }}
      >
        {voices.map((v, i) => (
          <MenuItem key={i} value={v.name}>
            {v.name.includes("Female") || v.name.includes("female") || v.name.includes("Nữ") ? "👩 Giọng nữ" : "👨 Giọng nam"} - {v.name}
          </MenuItem>
        ))}
      </Select>

      <Button variant="contained" onClick={startListening} disabled={isListening}>
        {isListening ? "Đang nghe..." : "🎙 Bắt đầu tâm sự"}
      </Button>

      {transcript && (
        <Box mt={3}>
          <Typography variant="subtitle1">Bạn nói:</Typography>
          <Typography variant="body1">{transcript}</Typography>
        </Box>
      )}

      {response && (
        <Box mt={2}>
          <Typography variant="subtitle1">Zenora trả lời:</Typography>
          <Typography variant="body1">{response}</Typography>
        </Box>
      )}
    </Box>
  );
};


import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  LinearProgress,
} from "@mui/material";

type Gender = "female" | "male" | null;

/* ================== STEP CONTENT ================== */
interface StepContent {
  title: string;
  description: string;
  target?: string;
}

const steps = [
  {
    title: "Chào bạn, mình là Lumora",
    text: "Để đồng hành cùng bạn trên hành trình học tập và định hướng tương lai, mình cần hiểu rõ bạn một chút trước đã.",
    target: "#menu-vireya",
  },
  {
    title: "Bắt đầu từ chính bạn",
    text: "Hãy bấm nút 'Cập nhật' ở trang chủ hoặc vào mục 'Kết quả học tập' trong VIREYA để nhập điểm số. Càng đầy đủ, mình càng gợi ý chính xác.",
    target: "#menu-vireya",
  },
  {
    title: "Vẽ ra con đường của riêng bạn",
    text: "Giỏi gì, thích gì, phù hợp ngành nào? Vào NEOVANA, cập nhật hồ sơ năng lực để mình gợi ý lộ trình nghề nghiệp sát với bạn nhất.",
    target: "#menu-neovana",
  },
  {
    title: "Lắng nghe chính mình",
    text: "Nếu thấy mệt mỏi hay nặng lòng, hãy ghé ZENORA. Viết vài dòng ở Void Zone hoặc Cloudwhisper để cảm xúc được giải tỏa nhẹ nhàng.",
    target: "#menu-zenora",
  },
  {
    title: "Và bạn không học một mình",
    text: "Vào ROBOKI khi cần giải bài, luyện thi hay tìm ý tưởng. Trợ giảng AI này sẽ hỗ trợ bạn 24/7, luôn kiên nhẫn và không bao giờ cáu.",
    target: "#menu-roboki",
  },
];



interface Props {
  open: boolean;
  onFinish: () => void;
  onSkipForever: () => void;
  isFirstTime: boolean;
}

export default function LumoraOnboarding({
  open,
  onFinish,
  onSkipForever,
  isFirstTime,
}: Props) {
  const [step, setStep] = useState<number>(-1); // -1 = chọn giới tính
  const [gender, setGender] = useState<Gender>(null);
  const [typedText, setTypedText] = useState("");

  const isFemale = gender === "female";
  const themeColor = isFemale ? "#ec4899" : "#3b82f6";

  /* ================== TYPEWRITER ================== */
  useEffect(() => {
    if (!open || step < 0) return;

    setTypedText("");
    let i = 0;
    const fullText = steps[step].text;

    const interval = setInterval(() => {
      setTypedText((prev) => prev + fullText[i]);
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 18);

    return () => clearInterval(interval);
  }, [step, open]);

  /* ================== HIGHLIGHT MENU ================== */
  useEffect(() => {
    if (!open || step < 0) return;

    document
      .querySelectorAll(".lumora-highlight")
      .forEach((el) => el.classList.remove("lumora-highlight"));

    const target = steps[step]?.target;
    if (target) {
      document.querySelector(target)?.classList.add("lumora-highlight");
    }

    return () => {
      document
        .querySelectorAll(".lumora-highlight")
        .forEach((el) => el.classList.remove("lumora-highlight"));
    };
  }, [step, open]);

  if (!open) return null;

  /* ================== STEP 0 – CHỌN GIỚI TÍNH ================== */
  if (step === -1) {
    return (
      <Box className="lumora-wow-overlay">
        <Card
          sx={{
            width: 460,
            p: 4,
            borderRadius: "28px",
            background: "#fff",
            textAlign: "center",
            boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
            animation: "wowIn 0.35s ease",
          }}
        >
          <Typography
            sx={{ fontSize: "1.6rem", fontWeight: 900, mb: 2 }}
          >
            Trước khi bắt đầu
          </Typography>

          <Typography sx={{ color: "#475569", mb: 4 }}>
            Bạn hãy chọn để Lumora đồng hành phù hợp hơn nhé.
          </Typography>

          <Stack direction="row" spacing={3} justifyContent="center">
            <Button
              onClick={() => {
                setGender("female");
                setStep(0);
              }}
              sx={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                fontSize: "3rem",
                background:
                  "linear-gradient(135deg,#f472b6,#ec4899)",
                boxShadow:
                  "0 20px 60px rgba(236,72,153,0.45)",
              }}
            >
              👩
            </Button>

            <Button
              onClick={() => {
                setGender("male");
                setStep(0);
              }}
              sx={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                fontSize: "3rem",
                background:
                  "linear-gradient(135deg,#60a5fa,#3b82f6)",
                boxShadow:
                  "0 20px 60px rgba(59,130,246,0.45)",
              }}
            >
              👨
            </Button>
          </Stack>
        </Card>

        <style>{overlayCSS}</style>
      </Box>
    );
  }

  /* ================== ONBOARDING MAIN ================== */
  return (
    <Box className="lumora-wow-overlay">
      <Card
        sx={{
          width: 540,
          p: 4,
          borderRadius: "32px",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 60px 160px rgba(0,0,0,0.6)",
        }}
      >
        <LinearProgress
          variant="determinate"
          value={((step + 1) / steps.length) * 100}
          sx={{
            height: 6,
            borderRadius: 999,
            backgroundColor: `${themeColor}33`,
            "& .MuiLinearProgress-bar": {
              background: themeColor,
            },
          }}
        />

        <Typography
          sx={{
            mt: 4,
            fontSize: "1.6rem",
            fontWeight: 900,
            color: themeColor,
            textAlign: "center",
          }}
        >
          {steps[step].title}
        </Typography>

        <Typography
          sx={{
            mt: 2,
            fontSize: "1.05rem",
            color: "#334155",
            textAlign: "center",
            lineHeight: 1.8,
            minHeight: 96,
          }}
        >
          {typedText}
        </Typography>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mt={5}
        >
          <Button
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Quay lại
          </Button>

          <Stack direction="row" spacing={1}>
            {!isFirstTime && (
              <Button
                onClick={onSkipForever}
                sx={{ fontSize: "0.8rem", color: "#94a3b8" }}
              >
                Bỏ qua những lần sau
              </Button>
            )}

            <Button
              variant="contained"
              onClick={
                step < steps.length - 1
                  ? () => setStep((s) => s + 1)
                  : onFinish
              }
              sx={{
                px: 4,
                py: 1.2,
                fontWeight: 800,
                borderRadius: 999,
                background: themeColor,
                boxShadow: `0 12px 40px ${themeColor}66`,
              }}
            >
              {step < steps.length - 1
                ? "Tiếp theo"
                : "Bắt đầu hành trình"}
            </Button>
          </Stack>
        </Stack>
      </Card>

      <style>{overlayCSS}</style>
    </Box>
  );
}

/* ================== SHARED CSS ================== */
const overlayCSS = `
  .lumora-wow-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(15,23,42,0.92);
    backdrop-filter: blur(14px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lumora-highlight {
    position: relative;
    z-index: 10000;
    border-radius: 14px;
    box-shadow: 0 0 0 6px rgba(59,130,246,0.55);
  }

  @keyframes wowIn {
    from {
      transform: scale(0.85);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

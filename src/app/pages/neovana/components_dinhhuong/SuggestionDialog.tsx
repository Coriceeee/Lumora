"use client";
import React, { useMemo, useState } from "react";
const motion = { div: (props: any) => <div {...props} /> };
const AnimatePresence = (props: any) => <>{props.children}</>;
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";
import ClearAllIcon from "@mui/icons-material/ClearAll";
const motion = { div: (props: any) => <div {...props} /> };


interface SuggestionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    strengths: string;
    interests: string;
    personality: string;
    dreamJob: string;
  }) => void;
}

const SuggestionDialog: React.FC<SuggestionDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const prefersReducedMotion = useReducedMotion();

  const [strengths, setStrengths] = useState("");
  const [interests, setInterests] = useState("");
  const [personality, setPersonality] = useState("");
  const [dreamJob, setDreamJob] = useState("");

  const disabled = useMemo(() => {
    // Yêu cầu tối thiểu: có ít nhất strengths và dreamJob
    return strengths.trim().length < 5 || dreamJob.trim().length < 3;
  }, [strengths, dreamJob]);

  const handleClear = () => {
    setStrengths("");
    setInterests("");
    setPersonality("");
    setDreamJob("");
  };

  const handleSubmit = () => {
    if (disabled) return;
    onSubmit({ strengths, interests, personality, dreamJob });
    onClose();
  };

  const variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${
            isDark ? "rgba(148,163,184,0.18)" : "rgba(59,130,246,0.18)"
          }`,
          boxShadow: isDark
            ? "0 12px 28px rgba(59,130,246,0.3)"
            : "0 12px 24px rgba(59,130,246,0.18)",
          background: isDark
            ? "linear-gradient(135deg, #0b1220 0%, #0f172a 100%)"
            : "linear-gradient(135deg, #f8fbff 0%, #eef7ff 100%)",
          backdropFilter: "saturate(120%) blur(6px)",
        },
      }}
    >
      <motion.div initial="hidden" animate="visible" variants={variants}>
        <DialogTitle
          sx={{
            py: 2,
            color: isDark ? "#e2e8f0" : "#0f172a",
            fontWeight: 800,
            letterSpacing: 0.2,
            background: isDark
              ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
              : "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
            borderBottom: `1px solid ${
              isDark ? "rgba(148,163,184,0.15)" : "rgba(59,130,246,0.15)"
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          Nhập thông tin định hướng
          <IconButton
            aria-label="Xóa toàn bộ"
            onClick={handleClear}
            size="small"
            sx={{
              ml: 1,
              color: isDark ? "#93c5fd" : "#3b82f6",
              "&:hover": { bgcolor: isDark ? "#0b1220" : "#e6f0ff" },
            }}
          >
            <ClearAllIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            borderColor: isDark ? "rgba(148,163,184,0.15)" : "rgba(59,130,246,0.15)",
            py: 2,
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Stack spacing={1.5}>
              <TextField
                label="Năng lực / Thế mạnh"
                fullWidth
                margin="dense"
                multiline
                minRows={2}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                autoFocus
                helperText={
                  strengths.trim().length < 5
                    ? "Mô tả tối thiểu 5 ký tự (ví dụ: Tư duy phân tích, giải quyết vấn đề, lập trình…)."
                    : " "
                }
                error={strengths.trim().length > 0 && strengths.trim().length < 5}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: isDark ? "rgba(2,6,23,0.5)" : "#fff",
                  },
                }}
              />

              <TextField
                label="Sở thích"
                fullWidth
                margin="dense"
                multiline
                minRows={2}
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                helperText="Ví dụ: Công nghệ, thiết kế sản phẩm, làm việc với dữ liệu…"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: isDark ? "rgba(2,6,23,0.5)" : "#fff",
                  },
                }}
              />

              <TextField
                label="Tính cách (tóm tắt)"
                fullWidth
                margin="dense"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="Ví dụ: Hướng nội, kỷ luật, tỉ mỉ; hoặc ENFJ/INTJ…"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: isDark ? "rgba(2,6,23,0.5)" : "#fff",
                  },
                }}
              />

              <TextField
                label="Ước mơ / Vị trí mong muốn"
                fullWidth
                margin="dense"
                value={dreamJob}
                onChange={(e) => setDreamJob(e.target.value)}
                helperText={
                  dreamJob.trim().length < 3
                    ? "Ví dụ: Kỹ sư thiết kế cơ khí, Data Analyst, Product Manager…"
                    : " "
                }
                error={dreamJob.trim().length > 0 && dreamJob.trim().length < 3}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: isDark ? "rgba(2,6,23,0.5)" : "#fff",
                  },
                }}
              />
            </Stack>
          </form>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2,
            py: 1.5,
            gap: 1,
            background: isDark ? "rgba(2,6,23,0.5)" : "rgba(255,255,255,0.6)",
          }}
        >
          <Button
            onClick={onClose}
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={disabled}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 2.5,
              boxShadow: "0 6px 16px rgba(59,130,246,0.25)",
            }}
          >
            Đồng ý
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};

export default SuggestionDialog;
function useReducedMotion() {
  throw new Error("Function not implemented.");
}


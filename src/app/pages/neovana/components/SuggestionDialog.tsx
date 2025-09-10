import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

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

const SuggestionDialog: React.FC<SuggestionDialogProps> = ({ open, onClose, onSubmit }) => {
  const [strengths, setStrengths] = useState("");
  const [interests, setInterests] = useState("");
  const [personality, setPersonality] = useState("");
  const [dreamJob, setDreamJob] = useState("");

  const handleSubmit = () => {
    onSubmit({ strengths, interests, personality, dreamJob });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DialogTitle sx={{ fontSize: "1.3rem", color: "#2C3E50" }}>Nhập thông tin định hướng</DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: "#F0F7FF", borderRadius: "16px" }}>
          <TextField
            label="Năng lực / Thế mạnh"
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            sx={{
              borderRadius: "8px",
              backgroundColor: "#fff",
              border: "1px solid #CCD6EB",
              "&:focus": { borderColor: "#89C4E2" },
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
            sx={{
              borderRadius: "8px",
              backgroundColor: "#fff",
              border: "1px solid #CCD6EB",
              "&:focus": { borderColor: "#89C4E2" },
            }}
          />
          <TextField
            label="Tính cách (tóm tắt)"
            fullWidth
            margin="dense"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            sx={{
              borderRadius: "8px",
              backgroundColor: "#fff",
              border: "1px solid #CCD6EB",
              "&:focus": { borderColor: "#89C4E2" },
            }}
          />
          <TextField
            label="Ước mơ / Vị trí mong muốn"
            fullWidth
            margin="dense"
            value={dreamJob}
            onChange={(e) => setDreamJob(e.target.value)}
            sx={{
              borderRadius: "8px",
              backgroundColor: "#fff",
              border: "1px solid #CCD6EB",
              "&:focus": { borderColor: "#89C4E2" },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ borderRadius: "30px", backgroundColor: "#A8D8FF", color: "#fff" }}>
            Đồng ý
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};

export default SuggestionDialog;

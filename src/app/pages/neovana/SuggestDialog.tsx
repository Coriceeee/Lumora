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
        <DialogTitle>Nhập thông tin định hướng</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Năng lực / Thế mạnh"
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
          />
          <TextField
            label="Sở thích"
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
          <TextField
            label="Tính cách (tóm tắt)"
            fullWidth
            margin="dense"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
          />
          <TextField
            label="Ước mơ / Vị trí mong muốn"
            fullWidth
            margin="dense"
            value={dreamJob}
            onChange={(e) => setDreamJob(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Đồng ý
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};

export default SuggestionDialog;

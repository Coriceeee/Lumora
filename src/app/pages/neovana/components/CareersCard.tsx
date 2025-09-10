import React from "react";
import { Card, CardContent, Typography, LinearProgress, Box } from "@mui/material";
import { Career } from "@/types/CareerDashboard";

interface Props {
  careers: Career[];
}

export default function CareersCard({ careers }: Props) {
  if (!careers || careers.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Nghề nghiệp gợi ý</Typography>
          <Typography color="textSecondary">Chưa có dữ liệu.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "1.2rem", color: "#4E81A8" }}>
          Nghề nghiệp gợi ý
        </Typography>
        {careers.map((c, idx) => (
          <Box key={idx} mb={2}>
            <Typography>
              <strong>{c.name}</strong> — {c.matchPercentage}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={c.matchPercentage}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Typography variant="body2" color="textSecondary">
              {c.reason}
            </Typography>
            <Typography variant="body2">Bước chuẩn bị: {c.steps}</Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

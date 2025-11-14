"use client";
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
  useTheme,
  LinearProgress,
} from "@mui/material";
import { Career } from "@/types/CareerDashboard";

export interface CareersCardProps {
  careers: Career[];
}

export default function CareersCard({ careers }: CareersCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!careers || careers.length === 0) {
    return (
      <Card sx={{ borderRadius: "20px", p: 2 }}>
        <CardContent>
          <Typography variant="h6">Nghề nghiệp gợi ý</Typography>
          <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: "20px", p: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Nghề nghiệp gợi ý
        </Typography>

        <Stack spacing={2}>
          {careers.map((c, idx) => {
            const pct = Math.max(0, Math.min(100, Number(c.matchPercentage || 0)));

            return (
              <Box
                key={idx}
                sx={{
                  p: 1.25,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>{c.name}</Typography>

                <Chip
                  label={`${pct}% phù hợp`}
                  size="small"
                  sx={{
                    mt: 1,
                    background: "#3b82f6",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                />

                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    mt: 1,
                    height: 10,
                    borderRadius: 20,
                  }}
                />

                {c.reason && (
                  <Typography sx={{ mt: 1 }} variant="body2">
                    {c.reason}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

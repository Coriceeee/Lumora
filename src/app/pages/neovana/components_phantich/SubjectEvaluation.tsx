// components_phantich/SubjectEvaluation.tsx
import * as React from "react";
import {
  Card, CardHeader, CardContent, Stack,
  Typography, Chip, Divider
} from "@mui/material";

export default function SubjectEvaluation({ data }: any) {
  if (!data || !data.length) return null;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Đánh giá Môn học" />
      <CardContent>
        <Stack spacing={2}>
          {data.map((s: any, idx: number) => (
            <Stack key={idx} spacing={0.8}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>{s.name}</Typography>
                <Chip
                  label={
                    s.score >= 7
                      ? "Tốt"
                      : s.score >= 5
                      ? "Đạt"
                      : "Cần cải thiện"
                  }
                  color={
                    s.score >= 7
                      ? "success"
                      : s.score >= 5
                      ? "warning"
                      : "error"
                  }
                />
              </Stack>

              <Typography sx={{ opacity: 0.7 }}>
                {s.score ?? 0} / 10
              </Typography>

              <Divider />
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

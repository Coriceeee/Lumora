import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  Chip,
  Divider,
} from "@mui/material";

export default function SubjectEvaluation({ data }: any) {
  if (!data || !data.length) return null;

  const getSubjectInsightChip = (score: number | undefined | null) => {
    const s = Number(score ?? 0);

    if (s >= 8) {
      return {
        label: "Điểm mạnh",
        color: "success",
      };
    }

    if (s < 5) {
      return {
        label: "Ưu tiên cải thiện",
        color: "error",
      };
    }

    return null;
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Đánh giá Môn học" />
      <CardContent>
        <Stack spacing={2}>
          {data.map((s: any, idx: number) => {
            const insight = getSubjectInsightChip(s.score);

            return (
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
                    size="small"
                  />
                </Stack>

                {insight && (
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={insight.label}
                      color={insight.color as any}
                    />
                  </Stack>
                )}

                <Typography sx={{ opacity: 0.7 }}>
                  {s.score ?? 0} / 10
                </Typography>

                <Divider />
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

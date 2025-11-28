import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  Chip,
  Divider,
  Button,
} from "@mui/material";

export default function SkillEvaluation({
  data,
  onAdd,
}: {
  data: any[];
  onAdd: (index: number) => void;
}) {
  if (!data || !data.length) return null;

  const getPriorityScore = (item: any): number => {
    if (typeof item.priorityRatio === "number") return item.priorityRatio*100;
    if (typeof item.priority === "number") return item.priority * 10;
    return 0;
  };

  const getInsightChip = (item: any) => {
    const score = getPriorityScore(item);

    if (item.status === "existing")
      return { label: "Đã đáp ứng", color: "success" };

    if (score >= 70) return { label: "Ưu tiên cao", color: "error" };
    if (score >= 40) return { label: "Cần chú ý", color: "warning" };

    return { label: "Mức ổn", color: "success" };
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Đánh giá Kỹ năng" />

      <CardContent>
        <Stack spacing={2}>
          {data.map((item, index) => {
            const insight = getInsightChip(item);
            const isExisting = item.status === "existing";

            return (
              <Stack key={index} spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>{item.name}</Typography>

                  <Chip
                    size="small"
                    variant="outlined"
                    color={insight.color as any}
                    label={insight.label}
                  />
                </Stack>

                {/* ⭐ Only one button left */}
                {!isExisting && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onAdd(index)}
                  >
                    Thêm vào hồ sơ
                  </Button>
                )}

                <Divider />
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

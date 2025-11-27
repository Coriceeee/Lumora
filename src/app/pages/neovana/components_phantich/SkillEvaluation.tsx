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

/**
 * PRO VERSION — SkillEvaluation.tsx
 * - Insight đặt đúng vị trí chip bên phải
 * - Khi status = existing → chip insight thay “Chưa đánh giá”
 * - Giao diện sạch đẹp
 */

export default function SkillEvaluation({
  data,
  onAdd,
  onMarkExisting,
}: {
  data: any[];
  onAdd: (index: number) => void;
  onMarkExisting: (index: number) => void;
}) {
  if (!data || !data.length) return null;

  // Tính điểm ưu tiên
  const getPriorityScore = (item: any): number => {
    if (typeof item.priorityRatio === "number") return item.priorityRatio;
    if (typeof item.priority === "number") return item.priority * 10;
    return 0;
  };

  // Insight chip
  const getInsightChip = (item: any) => {
    const score = getPriorityScore(item);

    if (score >= 70)
      return { label: "Ưu tiên cao", color: "error" } as const;

    if (score >= 40)
      return { label: "Cần chú ý", color: "warning" } as const;

    return { label: "Mức ổn định", color: "success" } as const;
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Đánh giá Kỹ năng" />

      <CardContent>
        <Stack spacing={2}>
          {data.map((item, index) => {
            const isExisting = item.status === "existing";
            const insight = getInsightChip(item);

            const rightChip = isExisting ? (
              <Chip
                size="small"
                variant="outlined"
                color={insight.color}
                label={insight.label}
              />
            ) : (
              <Chip
                size="small"
                label={
                  item.status === "need"
                    ? "Cần học thêm"
                    : "Chưa đánh giá"
                }
                color={
                  item.status === "need"
                    ? "warning"
                    : "default"
                }
              />
            );

            return (
              <Stack key={index} spacing={1}>
                {/* Name + chip */}
                <Stack direction="row" justifyContent="space-between">
                  <Typography>{item.name}</Typography>
                  {rightChip}
                </Stack>

                {/* Action buttons */}
                <Stack direction="row" spacing={1}>
                  {item.status === "need" && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onAdd(index)}
                    >
                      Bổ sung trực tiếp
                    </Button>
                  )}

                  {!isExisting && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onMarkExisting(index)}
                    >
                      Đã có
                    </Button>
                  )}
                </Stack>

                <Divider />
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

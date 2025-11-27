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
 * PRO VERSION — CertificateEvaluation.tsx
 * - Insight hoạt động như kỹ năng
 * - Trạng thái = existing sẽ đổi chip
 * - Giao diện sang trọng, đầy đủ logic
 */

export default function CertificateEvaluation({
  data,
  onAdd,
  onMarkExisting,
}: {
  data: any[];
  onAdd: (index: number) => void;
  onMarkExisting: (index: number) => void;
}) {
  if (!data || !data.length) return null;

  const getInsightChip = (item: any) => {
    if (item.status === "existing")
      return { label: "Đã đáp ứng", color: "success" } as const;

    if (item.status === "need")
      return { label: "Cần bổ sung", color: "warning" } as const;

    return { label: "Chưa đánh giá", color: "default" } as const;
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Đánh giá Chứng chỉ" />

      <CardContent>
        <Stack spacing={2}>
          {data.map((item, index) => {
            const insight = getInsightChip(item);
            const isExisting = item.status === "existing";

            return (
              <Stack key={index} spacing={1.2}>
                {/* Name + chip */}
                <Stack direction="row" justifyContent="space-between">
                  <Typography>{item.name}</Typography>

                  <Chip
                    size="small"
                    variant="outlined"
                    label={insight.label}
                    color={insight.color as any}
                  />
                </Stack>

                {/* Buttons */}
                <Stack direction="row" spacing={1}>
                  {item.status === "need" && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onAdd(index)}
                    >
                      Bổ sung trực tiếp
                    </Button>
                  )}

                  {!isExisting && (
                    <Button
                      size="small"
                      variant="contained"
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

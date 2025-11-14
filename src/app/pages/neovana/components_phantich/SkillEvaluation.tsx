// components_phantich/SkillEvaluation.tsx
import * as React from "react";
import {
  Card, CardContent, CardHeader, Stack,
  Typography, Chip, Button, Divider
} from "@mui/material";

export default function SkillEvaluation({ data, onAdd, onMarkExisting }: any) {
  if (!data || !data.length) return null;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Đánh giá Kỹ năng" subheader="Tình trạng năng lực" />
      <CardContent>
        <Stack spacing={2}>
          {data.map((item: any, idx: number) => (
            <Stack key={idx} spacing={0.8}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>{item.name}</Typography>
                <Chip
                  label={
                    item.status === "need"
                      ? "Cần học thêm"
                      : item.status === "existing"
                      ? "Đã đáp ứng"
                      : "Chưa đánh giá"
                  }
                  color={
                    item.status === "need"
                      ? "warning"
                      : item.status === "existing"
                      ? "success"
                      : "default"
                  }
                />
              </Stack>

              <Stack direction="row" spacing={1}>
                {item.status === "need" && (
                  <Button size="small" variant="outlined" onClick={() => onAdd(idx)}>
                    Bổ sung trực tiếp
                  </Button>
                )}

                {item.status !== "existing" && (
                  <Button size="small" variant="contained" onClick={() => onMarkExisting(idx)}>
                    Đã có
                  </Button>
                )}
              </Stack>

              <Divider />
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

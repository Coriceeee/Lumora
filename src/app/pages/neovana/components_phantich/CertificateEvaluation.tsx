// components_phantich/CertificateEvaluation.tsx
import * as React from "react";
import {
  Card, CardHeader, CardContent, Stack,
  Typography, Chip, Divider, Button
} from "@mui/material";

export default function CertificateEvaluation({
  data, onAdd, onMarkExisting
}: any) {
  if (!data || !data.length) return null;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Đánh giá Chứng chỉ" subheader="Tình trạng chứng chỉ" />
      <CardContent>
        <Stack spacing={2}>
          {data.map((item: any, idx: number) => (
            <Stack key={idx} spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>{item.name}</Typography>
                <Chip
                  label={
                    item.status === "need"
                      ? "Cần bổ sung"
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

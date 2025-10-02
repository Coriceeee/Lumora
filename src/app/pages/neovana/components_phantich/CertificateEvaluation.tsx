// src/app/pages/neovana/components/phantich/CertificateEvaluation.tsx
import * as React from "react";
import { Card, CardHeader, CardContent, Stack, Typography, Chip, Button } from "@mui/material";
import { ensureArray } from "../utils/ensureArray";

export interface CertEvalItem {
  name: string;
  has?: boolean;
  relevance?: number; // 0–100
  fitLevel?: "Rất phù hợp" | "Phù hợp" | "Trung bình" | "Chưa đạt";
  comment?: string;
}

type Props = {
  data?: CertEvalItem[] | CertEvalItem | null;
  onMarkExisting?: (index: number) => void;
};

export default function CertificateEvaluation({ data, onMarkExisting }: Props) {
  const list = ensureArray<CertEvalItem>(data);
  const [local, setLocal] = React.useState<CertEvalItem[]>(list);

  React.useEffect(() => {
    setLocal(ensureArray<CertEvalItem>(data));
  }, [data]);

  const handleMarkExisting = (idx: number) => {
    if (onMarkExisting) onMarkExisting(idx);
    setLocal(prev => {
      const copy = [...prev];
      if (copy[idx]) copy[idx] = { ...copy[idx], has: true };
      return copy;
    });
  };

  if (!local || local.length === 0) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>Không có dữ liệu chứng chỉ.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Đánh giá Chứng chỉ" subheader="Mức độ đáp ứng cho mục tiêu" />
      <CardContent>
        <Stack spacing={1.5}>
          {local.map((it, idx) => (
            <Stack key={`${it.name}-${idx}`} spacing={0.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">{it.name}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={it.has ? "Đã có" : "Chưa có"} color={it.has ? "success" : "default"} />
                  <Chip
                    size="small"
                    label={it.fitLevel ?? "Chưa đánh giá"}
                    color={
                      it.fitLevel === "Rất phù hợp" ? "success" :
                      it.fitLevel === "Phù hợp" ? "primary" :
                      it.fitLevel === "Trung bình" ? "warning" : "default"
                    }
                  />
                  {!it.has && (
                    <Button size="small" variant="contained" onClick={() => handleMarkExisting(idx)}>
                      Đã có
                    </Button>
                  )}
                </Stack>
              </Stack>

              <Typography variant="caption">Liên quan mục tiêu: {Math.round(it.relevance ?? 0)} / 100</Typography>
              {it.comment && <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.85 }}>{it.comment}</Typography>}
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

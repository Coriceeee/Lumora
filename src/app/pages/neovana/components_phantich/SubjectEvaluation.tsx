// src/app/pages/neovana/components/phantich/SkillEvaluation.tsx
import * as React from "react";
import { Card, CardHeader, CardContent, Stack, Typography, Chip, Button, Divider } from "@mui/material";
import { ensureArray } from "../utils/ensureArray";

export interface SkillEvalItem {
  skillName?: string;
  name?: string;
  detail?: string;
  status?: "need" | "existing" | "unknown" | "notHave";
  score?: number; // optional 0-100
}

type Props = {
  data?: SkillEvalItem[] | SkillEvalItem | null;
  onAdd?: (index: number) => void; // Bổ sung trực tiếp
  onMarkExisting?: (index: number) => void; // Đánh dấu là đã có
};

export default function SkillEvaluation({ data, onAdd, onMarkExisting }: Props) {
  const list = ensureArray<SkillEvalItem>(data);
  const [local, setLocal] = React.useState<SkillEvalItem[]>(list);

  React.useEffect(() => {
    setLocal(ensureArray<SkillEvalItem>(data));
  }, [data]);

  const handleMarkExisting = (idx: number) => {
    // gọi callback parent nếu có
    if (onMarkExisting) onMarkExisting(idx);

    // cập nhật UI local ngay
    setLocal(prev => {
      const copy = [...prev];
      if (copy[idx]) copy[idx] = { ...copy[idx], status: "existing" };
      return copy;
    });
  };

  const handleAdd = (idx: number) => {
    if (onAdd) onAdd(idx);

    // demo: cũng set existing để phản hồi UI
    setLocal(prev => {
      const copy = [...prev];
      if (copy[idx]) copy[idx] = { ...copy[idx], status: "existing" };
      return copy;
    });
  };

  if (!local || local.length === 0) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>Không có dữ liệu kỹ năng.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Đánh giá Kỹ năng" subheader="Tình trạng & đề xuất" />
      <CardContent>
        <Stack spacing={1.5}>
          {local.map((it, idx) => {
            const name = it.skillName || it.name || `Kỹ năng ${idx + 1}`;
            const status = it.status ?? "unknown";
            return (
              <Stack key={`${name}-${idx}`} spacing={0.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <div>
                    <Typography variant="subtitle2">{name}</Typography>
                    {it.detail && <Typography variant="body2" sx={{ opacity: 0.8 }}>{it.detail}</Typography>}
                  </div>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={
                        status === "need" ? "Cần cải thiện" :
                        status === "existing" ? "Đã có" :
                        status === "notHave" ? "Chưa có" : "Chưa đánh giá"
                      }
                      color={status === "need" ? "warning" : status === "existing" ? "success" : "default"}
                    />

                    {status === "need" && (
                      <Button size="small" variant="outlined" onClick={() => handleAdd(idx)}>
                        Bổ sung trực tiếp
                      </Button>
                    )}

                    {status !== "existing" && (
                      <Button size="small" variant="contained" onClick={() => handleMarkExisting(idx)}>
                        Đã có
                      </Button>
                    )}
                  </Stack>
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

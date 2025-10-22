// src/app/pages/neovana/components_phantich/SkillSuggestions.tsx
import * as React from "react";
import { Card, CardHeader, CardContent, Stack, Typography, Chip, Button, Divider } from "@mui/material";

export interface SkillSuggestionItem {
  skillName: string;
  priority?: "High" | "Medium" | "Low";
  detail?: string;
  type?: string; // để lọc
}

type Props = {
  data?: SkillSuggestionItem[] | SkillSuggestionItem | null;
  onAdd?: (index: number) => void; // callback khi click "Thêm vào"
};

export default function SkillSuggestions({ data, onAdd }: Props) {
  const list = Array.isArray(data) ? data : data ? [data] : [];
  const [local, setLocal] = React.useState<SkillSuggestionItem[]>(list);

  React.useEffect(() => setLocal(list), [data]);

  const handleAdd = (idx: number) => {
    if (onAdd) onAdd(idx);
    setLocal(prev => {
      const copy = [...prev];
      if (copy[idx]) copy.splice(idx, 1); // xóa skill vừa thêm
      return copy;
    });
  };

  if (!local.length) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>Không có gợi ý kỹ năng.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Gợi ý Kỹ năng" subheader="Bổ sung khoảng trống" />
      <CardContent>
        <Stack spacing={1.5}>
          {local.map((item, idx) => (
            <Stack key={`${item.skillName}-${idx}`} spacing={0.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <div>
                  <Typography variant="subtitle2">{item.skillName}</Typography>
                  {item.detail && <Typography variant="body2" sx={{ opacity: 0.8 }}>{item.detail}</Typography>}
                </div>
                <Stack direction="row" spacing={1} alignItems="center">
                  {item.priority && (
                    <Chip
                      size="small"
                      label={
                        item.priority === "High" ? "Ưu tiên cao" :
                        item.priority === "Medium" ? "Ưu tiên trung bình" : "Ưu tiên thấp"
                      }
                      color={item.priority === "High" ? "error" :
                             item.priority === "Medium" ? "warning" : "default"}
                    />
                  )}
                  <Button size="small" variant="outlined" color="primary" onClick={() => handleAdd(idx)}>
                    Thêm vào
                  </Button>
                </Stack>
              </Stack>
              <Divider />
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

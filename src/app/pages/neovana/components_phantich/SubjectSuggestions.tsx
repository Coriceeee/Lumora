// src/app/pages/neovana/components_phantich/SubjectSuggestions.tsx
import * as React from "react";
import { Card, CardHeader, CardContent, Stack, Typography, Chip, Divider, Button } from "@mui/material";

export interface SubjectSuggestionItem {
  name: string;
  priority?: "High" | "Medium" | "Low";
  comment?: string;
}

type Props = {
  data?: SubjectSuggestionItem[] | SubjectSuggestionItem | null;
  onAdd?: (index: number) => void; // callback khi click "Thêm vào môn học cần cải thiện"
};

const SubjectSuggestions: React.FC<Props> = ({ data, onAdd }) => {
  const list = Array.isArray(data) ? data : data ? [data] : [];
  const [local, setLocal] = React.useState<SubjectSuggestionItem[]>(list);

  React.useEffect(() => setLocal(list), [data]);

  const handleAdd = (idx: number) => {
    if (onAdd) onAdd(idx);
    // Xóa khỏi danh sách gợi ý khi đã thêm
    setLocal(prev => {
      const copy = [...prev];
      if (copy[idx]) copy.splice(idx, 1);
      return copy;
    });
  };

  if (!local || local.length === 0) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>Không có gợi ý môn học.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Gợi ý Môn học" subheader="Các môn học cần cải thiện" />
      <CardContent>
        <Stack spacing={1.5}>
          {local.map((item, idx) => (
            <Stack key={`${item.name}-${idx}`} spacing={0.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <div>
                  <Typography variant="subtitle2">{item.name}</Typography>
                  {item.comment && <Typography variant="body2" sx={{ opacity: 0.8 }}>{item.comment}</Typography>}
                </div>
                <Stack direction="row" spacing={1} alignItems="center">
                  {item.priority && (
                    <Chip
                      size="small"
                      label={
                        item.priority === "High" ? "Ưu tiên cao" :
                        item.priority === "Medium" ? "Ưu tiên trung bình" : "Ưu tiên thấp"
                      }
                      color={
                        item.priority === "High" ? "error" :
                        item.priority === "Medium" ? "warning" : "default"
                      }
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
};

export default SubjectSuggestions;

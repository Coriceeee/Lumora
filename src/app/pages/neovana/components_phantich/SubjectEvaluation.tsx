// src/app/pages/neovana/components_phantich/SubjectEvaluation.tsx
import * as React from "react";
import { Card, CardHeader, CardContent, Stack, Typography, Chip, Divider } from "@mui/material";

export interface SubjectItem {
  name: string;
  avgScore?: number; // thang 0–10
  status?: "need" | "existing" | "unknown"; // trạng thái môn học
  type?: string; // để phân biệt nếu data trộn nhiều loại
  comment?: string;
}

type Props = {
  data?: SubjectItem[] | SubjectItem | null;
};

export default function SubjectEvaluation({ data }: Props) {
  // Chỉ lấy các item type môn học
  const subjects = (Array.isArray(data) ? data : data ? [data] : []).filter(item => !item.type || item.type === "subject");

  if (!subjects || subjects.length === 0) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>Không có dữ liệu môn học.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Đánh giá Môn học" subheader="Điểm trung bình & tình trạng" />
      <CardContent>
        <Stack spacing={1.5}>
          {subjects.map((subj, idx) => {
            const name = subj.name || `Môn ${idx + 1}`;
            const status = subj.status ?? "unknown";
            return (
              <Stack key={`${name}-${idx}`} spacing={0.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">{name}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={
                        status === "need" ? "Cần cải thiện" :
                        status === "existing" ? "Đã có" :
                        "Chưa đánh giá"
                      }
                      color={status === "need" ? "warning" : status === "existing" ? "success" : "default"}
                    />
                    <Typography variant="body2">{subj.avgScore?.toFixed(1) ?? 0} / 10</Typography>
                  </Stack>
                </Stack>
                {subj.comment && <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>{subj.comment}</Typography>}
                <Divider />
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

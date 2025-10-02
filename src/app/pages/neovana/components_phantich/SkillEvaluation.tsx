// src/app/pages/neovana/components/phantich/SkillEvaluation.tsx
import * as React from "react";
import {
  Card, CardHeader, CardContent, Stack,
  Typography, Chip, LinearProgress
} from "@mui/material";
import { ensureArray } from "../utils/ensureArray";

export interface SkillEvalItem {
  name: string;
  currentScore: number; // 0–100
  relevance: number;    // 0–100
  fitLevel: "Rất phù hợp" | "Phù hợp" | "Trung bình" | "Chưa đạt";
  comment: string;
}

export default function SkillEvaluation(props: {
  data: SkillEvalItem[] | SkillEvalItem | null | undefined;
}) {
  const list = ensureArray<SkillEvalItem>(props.data);

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Đánh giá Kỹ năng" subheader="Mức độ đáp ứng cho mục tiêu" />
      <CardContent>
        {list.length === 0 ? (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Không có dữ liệu kỹ năng.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {list.map((it: SkillEvalItem, idx: number) => {
              const validScore = isNaN(it.currentScore) ? 0 : it.currentScore;
              const validRelevance = isNaN(it.relevance) ? 0 : it.relevance;
              
              return (
                <Stack key={`${it.name}-${idx}`} spacing={0.75}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle2">{it.name}</Typography>
                    <Chip
                      size="small"
                      label={it.fitLevel}
                      color={
                        it.fitLevel === "Rất phù hợp" ? "success" :
                        it.fitLevel === "Phù hợp" ? "primary" :
                        it.fitLevel === "Trung bình" ? "warning" : "default"
                      }
                    />
                  </Stack>

                  <Typography variant="caption">
                    Mức hiện có: {Math.round(validScore)} / 100
                  </Typography>
                  <LinearProgress variant="determinate" value={validScore} />

                  <Typography variant="caption" sx={{ mt: 0.5 }}>
                    Liên quan mục tiêu: {Math.round(validRelevance)} / 100
                  </Typography>
                  <LinearProgress variant="determinate" value={validRelevance} color="secondary" />

                  {it.comment && (
                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.85 }}>
                      {it.comment}
                    </Typography>
                  )}
                </Stack>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

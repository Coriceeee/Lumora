import * as React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

import { Card, CardHeader, CardContent, Typography, Box } from "@mui/material";

export default function RadarCerti({ data, title }: any) {
  if (!data || !data.labels || !data.values || !data.labels.length) return null;

  // Xử lý dữ liệu dạng Recharts
  const chart = data.labels.map((label: string, i: number) => ({
    skill: label,
    score: Number(data.values[i] ?? 0),
  }));

  // Trung bình đánh giá tổng quan
  const avg =
    data.values.reduce((sum: number, v: number) => sum + (Number(v) || 0), 0) /
    data.values.length;

  // Nhận xét tổng quan
  const getSummaryText = () => {
    if (avg >= 80) return "Năng lực chứng chỉ rất mạnh và phù hợp định hướng.";
    if (avg >= 60) return "Bạn có nền tảng tốt, chỉ cần bổ sung thêm một số chứng chỉ.";
    if (avg >= 40) return "Cần cải thiện thêm để đáp ứng yêu cầu ngành.";
    return "Hồ sơ chứng chỉ còn yếu – nên ưu tiên bồi dưỡng thêm.";
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title={title || "Biểu đồ Chứng chỉ"} />

      <CardContent>
        {/* Biểu đồ */}
        <Box sx={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chart}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 11 }} />

              <Radar
                name="Chứng chỉ"
                dataKey="score"
                stroke="#407BFF"
                fill="#407BFF"
                fillOpacity={0.55}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>

        {/* Nhận xét */}
        <Box mt={2}>
          <Typography fontWeight={600} sx={{ mb: 0.5 }}>
            Nhận xét tổng quan
          </Typography>
          <Typography>{getSummaryText()}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

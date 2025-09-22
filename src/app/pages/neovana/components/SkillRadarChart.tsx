import * as React from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend,
} from "recharts";
import { Typography } from "@mui/material";

export interface SkillDatum {
  name: string;
  score: number;
}

interface Props {
  title?: string;
  subtitle?: string;
  data: SkillDatum[];
  benchmark?: SkillDatum[];
  benchmarkLabel?: string;
}

export default function SkillRadarChart({
  title,
  subtitle,
  data,
  benchmark = [],
  benchmarkLabel = "Mục tiêu",
}: Props) {
  // Nếu không có dữ liệu -> trả về thông báo
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Typography variant="subtitle1" color="text.secondary">
          Chưa có dữ liệu để hiển thị biểu đồ radar.
        </Typography>
      </div>
    );
  }

  // Kết hợp dữ liệu hiện tại và benchmark để tránh lỗi khi map
  const merged = data.map((d) => {
    const bm = benchmark.find((b) => b.name === d.name);
    return {
      name: d.name,
      current: d.score,
      target: bm ? bm.score : 0,
    };
  });

  return (
    <div style={{ width: "100%", height: 400 }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" gutterBottom color="text.secondary">
          {subtitle}
        </Typography>
      )}
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={merged}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Hiện tại"
            dataKey="current"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.5}
          />
          {benchmark && benchmark.length > 0 && (
            <Radar
              name={benchmarkLabel || "Mục tiêu"}
              dataKey="target"
              stroke="#FF7300"
              fill="#FF7300"
              fillOpacity={0.3}
            />
          )}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

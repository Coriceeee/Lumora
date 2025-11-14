// components_phantich/RadarSkillsChart.tsx
import * as React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function RadarSkillsChart({ data }: any) {
  if (!data) return null;

  const chart = data.labels.map((label: string, i: number) => ({
    skill: label,
    score: data.values[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chart}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis domain={[0, 100]} />
        <Radar
          name="Kỹ năng"
          dataKey="score"
          stroke="#407BFF"
          fill="#407BFF"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

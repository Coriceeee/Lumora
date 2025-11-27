import * as React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function RadarSubjectsChart({ data }: any) {
  if (!data || !data.labels || !data.labels.length) return null;

  const chart = data.labels.map((label: string, i: number) => ({
    subject: label,
    score: data.values[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chart}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis domain={[0, 10]} />
        <Radar
          name="Môn học"
          dataKey="score"
          stroke="#FF8A3D"
          fill="#FF8A3D"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

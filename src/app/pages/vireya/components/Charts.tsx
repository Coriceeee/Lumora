import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const lineColors = ["#2563eb", "#ff6347", "#22c55e", "#f59e0b", "#8b5cf6"];

export const RadarChartOverview = ({ data }: { data: { subject: string; score: number }[] }) => {
  if (!data || data.length === 0) return <p>Chưa có dữ liệu để hiển thị biểu đồ Radar.</p>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart outerRadius={110} data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 10]} />
        <Radar
          name="Học lực"
          dataKey="score"
          stroke="#2563eb"
          fill="#3b82f6"
          fillOpacity={0.6}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export const TrendLineChart = ({
  data,
  subjects
}: {
  data: any[];
  subjects: string[];
}) => {
  if (!data || data.length === 0)
    return <p>Chưa có dữ liệu để hiển thị biểu đồ xu hướng.</p>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        {subjects.map((s, i) => (
          <Line
            key={s}
            type="monotone"
            dataKey={s}
            stroke={lineColors[i % lineColors.length]}
            strokeWidth={2}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

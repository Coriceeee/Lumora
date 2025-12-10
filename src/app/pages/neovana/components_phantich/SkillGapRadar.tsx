"use client";

import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend, PolarRadiusAxis } from "recharts";

export default function SkillGapRadar({ data }: any) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((d: any) => ({
    skill: d.skill,
    User: d.userValue,
    Required: d.required
  }));

  return (
    <RadarChart cx={250} cy={150} outerRadius={120} width={500} height={300} data={chartData}>
      <PolarGrid />
      <PolarAngleAxis dataKey="skill" />
      <PolarRadiusAxis angle={30} domain={[0, 100]} />
      <Radar name="Người dùng" dataKey="User" stroke="#4ade80" fill="#4ade80" fillOpacity={0.45} />
      <Radar name="Chuẩn ngành" dataKey="Required" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.35} />
      <Legend />
    </RadarChart>
  );
}

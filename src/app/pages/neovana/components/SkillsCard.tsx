import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { SkillToImprove } from "@/types/CareerDashboard";

export interface Skill {
  name: string;
  priority: number;
  priorityRatio: number;
  reason?: string;
}

interface Props {
  skills: Skill[];
}

const COLORS = ["#4f46e5", "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function SkillsCard({ skills }: Props) {
  if (!skills || skills.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Kỹ năng cần cải thiện</Typography>
          <Typography color="textSecondary">Chưa có dữ liệu.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
      <CardContent> 
        <Typography variant="h6" gutterBottom sx={{ fontSize: "1.2rem", color: "#4E81A8" }}>
          Kỹ năng cần cải thiện
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={skills}
              dataKey="priorityRatio"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={(entry: Skill) => entry.name}
            >
              {skills.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        {skills.map((s, idx) => (
          <Typography key={idx} variant="body2" sx={{ mt: 1 }}>
            <strong>{s.name}</strong> — Priority {s.priority}{" "}
            {s.reason && `(${s.reason})`}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
}

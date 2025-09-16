import React from "react";
import { Card, CardContent, Typography, List,
  ListItem,
  ListItemText, } from "@mui/material";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { SkillToImprove } from "@/types/CareerDashboard";
import '../DinhHuongPhatTrienPage.css';  // Đảm bảo đường dẫn đúng

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
        <ResponsiveContainer width="100%" height={280}>
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
        <List>
                  {skills.map((s, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${s.name}`}
                        secondary={`Ưu tiên: ${s.priority} | Lý do: ${s.reason}`}
                        sx={{
                          fontSize: "1rem",
                          color: "#6b7280",
                          fontWeight: "500",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

      </CardContent>
    </Card>
  );
}

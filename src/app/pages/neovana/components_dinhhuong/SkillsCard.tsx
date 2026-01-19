import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

export interface Skill {
  name: string;
  priority: number;
  priorityRatio: number; // 0–1 (AI trả)
  reason?: string;
}

interface Props {
  skills: Skill[];
}

const COLORS = ["#4f46e5", "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

const clamp01 = (v: any) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
};

export default function SkillsCard({ skills }: Props) {
  // DEBUG 1 dòng: mở console là biết có data hay không
  // console.log("[SkillsCard] skills=", skills);

  if (!skills || skills.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Kỹ năng cần cải thiện</Typography>
          <Typography color="textSecondary">Chưa có dữ liệu kỹ năng.</Typography>
        </CardContent>
      </Card>
    );
  }

  // ✅ 1 công thức duy nhất: "mức độ cần cải thiện" = (1 - ratio) * 100
  const normalized = skills.map((s) => {
    const r = clamp01(s.priorityRatio);
    const needImprove = Math.round((1 - r) * 100);
    return { ...s, needImprove, _ratio: r };
  });

  // dữ liệu chart: chỉ giữ slice > 0 để recharts không “lụi”
  const chartData = normalized
    .map((s) => ({ name: s.name, value: s.needImprove }))
    .filter((x) => x.value > 0);

  const allZero = chartData.length === 0;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: "1.2rem", color: "#4E81A8", fontWeight: 700 }}
        >
          Kỹ năng cần cải thiện
        </Typography>

        {!allZero ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Typography color="text.secondary" fontStyle="italic" sx={{ mt: 1 }}>
            AI chưa xác định được kỹ năng cần ưu tiên rõ ràng.
          </Typography>
        )}

        <List>
          {normalized.map((s, index) => (
            <ListItem key={index} alignItems="flex-start">
              <ListItemText
                primary={s.name}
                secondary={
                  <>
                    <span>
                      Mức độ cần cải thiện: <strong>{s.needImprove}%</strong>
                    </span>
                    {s.reason && (
                      <>
                        <br />
                        <span>Lý do: {s.reason}</span>
                      </>
                    )}
                  </>
                }
                sx={{
                  "& .MuiListItemText-primary": { fontWeight: 600 },
                  "& .MuiListItemText-secondary": { color: "#6b7280" },
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { CareerDashboard } from "@/types/CareerDashboard";

interface Props {
  dashboard: CareerDashboard;
}

export default function SummaryCard({ dashboard }: Props) {
  return (
    <Card sx={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "1.2rem", color: "#4E81A8" }}>
          Tổng quan
        </Typography>
        <Typography variant="subtitle1">{dashboard.title}</Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {new Date(dashboard.createdAt).toLocaleString()}
        </Typography>
        <Typography>{dashboard.summary}</Typography>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { CareerDashboard } from "@/types/CareerDashboard";
import '../DinhHuongPhatTrienPage.css';  // Đảm bảo đường dẫn đúng

interface Props {
  dashboard: CareerDashboard;
}

export default function SummaryCard({ dashboard }: Props) {
  return (
    <Card sx={{ borderRadius: "16px", boxShadow: "0 6px 18px rgba(0, 0, 0, 0.15)", padding: "16px", transition: "all 0.3s ease", "&:hover": { boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)" } }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "1.4rem", color: "#3b82f6", fontWeight: "600", marginBottom: "12px" }}>
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

// src/app/pages/neovana/components/SummaryCard.tsx
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { CareerDashboard } from "@/types/CareerDashboard";

interface Props {
  dashboard: CareerDashboard;
}

export default function SummaryCard({ dashboard }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
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

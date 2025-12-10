"use client";

import React from "react";
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow, useTheme } from "@mui/material";

interface CareerFitMatrixProps {
  careers: {
    name: string;
    matchPercentage: number;
    bestSubject?: string;
    bestSkill?: string;
    weakestSkill?: string;
  }[];
}

export default function CareerFitMatrix({ careers }: CareerFitMatrixProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!careers || careers.length === 0) return null;

  return (
    <Card
      sx={{
        borderRadius: 3,
        mt: 3,
        background: isDark
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        boxShadow: isDark
          ? "0 6px 16px rgba(59,130,246,0.35)"
          : "0 6px 16px rgba(59,130,246,0.22)",
        p: 2.5,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 800,
            color: isDark ? "#93c5fd" : "#2563eb",
            fontSize: "1.4rem",
          }}
        >
          📊 Ma trận phù hợp nghề nghiệp
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Ngành</strong></TableCell>
              <TableCell><strong>Match</strong></TableCell>
              <TableCell><strong>Môn mạnh nhất</strong></TableCell>
              <TableCell><strong>Kỹ năng mạnh nhất</strong></TableCell>
              <TableCell><strong>Kỹ năng yếu nhất</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {careers.map((c, i) => (
              <TableRow key={i}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.matchPercentage}%</TableCell>
                <TableCell>{c.bestSubject ?? "—"}</TableCell>
                <TableCell>{c.bestSkill ?? "—"}</TableCell>
                <TableCell>{c.weakestSkill ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

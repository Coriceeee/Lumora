"use client";
import React from "react";
import ReactApexChart from "react-apexcharts";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
  useTheme,
} from "@mui/material";
import { CertificateToAdd } from "@/types/CareerDashboard";

/* ================== UTILS (ĐẶT TRƯỚC COMPONENT) ================== */

const normalizePercent = (value: string | number): number => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;

  // 0–1 → %
  if (num > 0 && num <= 1) return num * 100;

  return num;
};

const clamp01_100 = (value: number): number => {
  return Math.max(0, Math.min(100, Math.round(value)));
};

const getPriorityColor = (v: number, dark: boolean) => {
  if (v >= 80) return dark ? "#16a34a" : "#22c55e";
  if (v >= 60) return dark ? "#2563eb" : "#3b82f6";
  if (v >= 40) return dark ? "#ca8a04" : "#f59e0b";
  return dark ? "#ef4444" : "#f87171";
};

/* ================== COMPONENT ================== */

interface Props {
  certificates: CertificateToAdd[];
}

export default function CertificatesCard({ certificates }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!certificates || certificates.length === 0) {
    return (
      <Card sx={{ p: 2, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6">Chứng chỉ cần thiết</Typography>
          <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
        </CardContent>
      </Card>
    );
  }

  const labels = certificates.map((c) => c.name);

  const chartSeries = certificates.map((c) =>
    clamp01_100(normalizePercent(c.priorityRatio ?? 0))
  );

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut" },
    labels,
    legend: { position: "bottom" },
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, p: 2 }}>
      <CardContent sx={{ p: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Chứng chỉ cần bổ sung
        </Typography>

        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="donut"
          width="100%"
        />

        <Stack spacing={2} mt={2}>
          {certificates.map((c, i) => {
            const ratio = clamp01_100(
              normalizePercent(c.priorityRatio ?? 0)
            );
            const color = getPriorityColor(ratio, isDark);

            return (
              <Box
                key={i}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid #eee",
                }}
              >
                <Typography fontWeight={600}>{c.name}</Typography>
                <Chip
                  label={`${ratio}% ưu tiên`}
                  sx={{ mt: 1, background: color, color: "#fff" }}
                />
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

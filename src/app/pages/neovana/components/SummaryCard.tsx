import { Card, CardContent, Typography, useTheme } from "@mui/material";

interface Props {
  dashboard: {
    title: string;
    createdAt: string;
    summary: string;
  };
}

export default function SummaryCard({ dashboard }: Props) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Card
      sx={{
        borderRadius: "20px",
        background: isDarkMode
          ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
          : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        boxShadow: isDarkMode
          ? "0 6px 16px rgba(59, 130, 246, 0.35)"
          : "0 6px 16px rgba(59, 130, 246, 0.15)",
        padding: "20px",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isDarkMode
            ? "0 12px 24px rgba(59, 130, 246, 0.5)"
            : "0 12px 24px rgba(59, 130, 246, 0.25)",
        },
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontSize: "1.5rem",
            color: "#3b82f6",
            fontWeight: "700",
            marginBottom: "12px",
          }}
        >
          Tổng quan
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "600",
            marginBottom: "6px",
            color: isDarkMode ? "#f1f5f9" : "#111827",
          }}
        >
          {dashboard.title}
        </Typography>
        <Typography
          variant="body2"
          gutterBottom
          sx={{
            fontStyle: "italic",
            color: isDarkMode ? "#94a3b8" : "#6b7280",
          }}
        >
          {new Date(dashboard.createdAt).toLocaleString()}
        </Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            lineHeight: 1.6,
            color: isDarkMode ? "#e2e8f0" : "#374151",
          }}
        >
          {dashboard.summary}
        </Typography>
      </CardContent>
    </Card>
  );
}

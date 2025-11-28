import { Card, CardContent, Typography, useTheme, Box } from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium"; // icon “huy chương”
import TrendingUpIcon from "@mui/icons-material/TrendingUp"; // icon xu hướng

interface Props {
  dashboard: {
    title: string;
    createdAt: string;
    summary: string;
    careers?: {
      name: string;
      matchPercentage?: number;
    }[];
  };
}

export default function SummaryCard({ dashboard }: Props) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Hàm đổi màu theo mức match
  const getMatchColor = (val: number = 0) => {
    if (val >= 80) return "#16a34a"; // xanh mạnh
    if (val >= 60) return "#eab308"; // vàng
    return "#dc2626"; // đỏ cảnh báo
  };

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
            mb: "12px",
          }}
        >
          Tổng quan
        </Typography>

        {/* Title */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "600",
            mb: "6px",
            color: isDarkMode ? "#f1f5f9" : "#111827",
          }}
        >
          {dashboard.title}
        </Typography>

        {/* Created At */}
        <Typography
          variant="body2"
          sx={{
            fontStyle: "italic",
            color: isDarkMode ? "#94a3b8" : "#6b7280",
          }}
        >
          {new Date(dashboard.createdAt).toLocaleString()}
        </Typography>

        {/* Summary */}
        <Typography
          sx={{
            fontSize: "1rem",
            lineHeight: 1.6,
            mt: 1,
            color: isDarkMode ? "#e2e8f0" : "#374151",
          }}
        >
          {dashboard.summary}
        </Typography>

        {/* ---------------- MATCH PERCENT ---------------- */}
        {dashboard.careers && (
          <Box mt={3}>
            <Typography
              sx={{
                fontWeight: "700",
                fontSize: "1.15rem",
                mb: 1.4,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#3b82f6",
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 22 }} />
              Mức độ phù hợp ngành nghề
            </Typography>

            {/* Danh sách ngành + match */}
            {dashboard.careers.map((c, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 0.7,
                  p: "6px 10px",
                  borderRadius: "10px",
                  background: isDarkMode
                    ? "rgba(148,163,184,0.08)"
                    : "rgba(59,130,246,0.08)",
                }}
              >
                <WorkspacePremiumIcon
                  sx={{ color: getMatchColor(c.matchPercentage), fontSize: 22 }}
                />

                <Typography
                  sx={{
                    fontSize: ".95rem",
                    flexGrow: 1,
                    color: isDarkMode ? "#cbd5e1" : "#1e293b",
                  }}
                >
                  {c.name}
                </Typography>

                <Typography
                  sx={{
                    fontWeight: "700",
                    color: getMatchColor(c.matchPercentage),
                  }}
                >
                  {c.matchPercentage ?? 0}%
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

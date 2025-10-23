"use client";
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Chip,
  Stack,
  useTheme,
} from "@mui/material";
import { Career } from "@/types/CareerDashboard";
import { useHistory } from "react-router-dom";
import { KTSVG } from "../../../../_start/helpers/components/KTSVG";

interface Props {
  careers: Career[];
}

const getProgressColor = (v: number, dark = false) => {
  if (v >= 80) {
    return {
      track: dark ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.15)",
      barFrom: "#22c55e",
      barTo: "#16a34a",
      chip: dark ? "#16a34a" : "#22c55e",
    };
  }
  if (v >= 60) {
    return {
      track: dark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.15)",
      barFrom: "#3b82f6",
      barTo: "#2563eb",
      chip: dark ? "#2563eb" : "#3b82f6",
    };
  }
  if (v >= 40) {
    return {
      track: dark ? "rgba(234,179,8,0.18)" : "rgba(234,179,8,0.2)",
      barFrom: "#f59e0b",
      barTo: "#d97706",
      chip: dark ? "#ca8a04" : "#f59e0b",
    };
  }
  return {
    track: dark ? "rgba(248,113,113,0.18)" : "rgba(248,113,113,0.2)",
    barFrom: "#f87171",
    barTo: "#ef4444",
    chip: dark ? "#ef4444" : "#f87171",
  };
};

export default function CareersCard({ careers }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const history = useHistory();

  if (!careers || careers.length === 0) {
    return (
      <Card
        sx={{
          borderRadius: "20px",
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #111827 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
          boxShadow: isDark
            ? "0 6px 16px rgba(59,130,246,0.25)"
            : "0 6px 16px rgba(59,130,246,0.15)",
          p: 2.5,
          border: `1px solid ${
            isDark ? "rgba(148,163,184,0.18)" : "rgba(59,130,246,0.15)"
          }`,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: isDark ? "#93c5fd" : "#3b82f6",
              mb: 1,
            }}
          >
            Nghề nghiệp gợi ý
          </Typography>
          <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: "20px",
        background: isDark
          ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
          : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        boxShadow: isDark
          ? "0 6px 16px rgba(59,130,246,0.35)"
          : "0 6px 16px rgba(59,130,246,0.15)",
        p: 2.5,
        transition: "box-shadow 0.3s ease, transform 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isDark
            ? "0 12px 28px rgba(59,130,246,0.5)"
            : "0 12px 24px rgba(59,130,246,0.25)",
        },
        border: `1px solid ${
          isDark ? "rgba(148,163,184,0.15)" : "rgba(59,130,246,0.15)"
        }`,
        backdropFilter: "saturate(120%) blur(2px)",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Tiêu đề + nút điều hướng */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.5rem",
              color: isDark ? "#60a5fa" : "#3b82f6",
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            Nghề nghiệp gợi ý
          </Typography>

          <button
            type="button"
            className="btn btn-sm btn-icon btn-color-primary btn-active-light-primary"
            onClick={() => history.push("/neovana/dinh-huong-phat-trien")}
          >
            <KTSVG
              path="/media/icons/duotone/Navigation/Arrow-right.svg"
              className="svg-icon-1"
            />
          </button>
        </Box>

        <Stack spacing={2}>
          {careers.map((c, idx) => {
            const pct = Math.max(0, Math.min(100, Number(c.matchPercentage || 0)));
            const colors = getProgressColor(pct, isDark);

            const stepsList = Array.isArray((c as any).steps)
              ? (c as any).steps
              : String((c as any).steps || "")
                  .split("|")
                  .map((s) => s.trim())
                  .filter(Boolean);

            return (
              <Box
                key={`${c.name}-${idx}`}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: `1px dashed ${
                    isDark ? "rgba(148,163,184,0.25)" : "rgba(59,130,246,0.25)"
                  }`,
                  background: isDark ? "rgba(2,6,23,0.4)" : "rgba(255,255,255,0.6)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 0.75,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: isDark ? "#e2e8f0" : "#0f172a",
                      lineHeight: 1.3,
                    }}
                  >
                    {c.name}
                  </Typography>

                  <Chip
                    label={`${pct}% phù hợp`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      color: "#fff",
                      background: colors.chip,
                    }}
                  />
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={pct}
                  aria-label={`Mức độ phù hợp ${pct}%`}
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: colors.track,
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      backgroundImage: `linear-gradient(90deg, ${colors.barFrom}, ${colors.barTo})`,
                    },
                    mb: 1,
                  }}
                />

                {c.reason && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDark ? "#94a3b8" : "#475569",
                      mb: stepsList.length ? 0.75 : 0,
                    }}
                  >
                    {c.reason}
                  </Typography>
                )}

                {!!stepsList.length && (
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {stepsList.map((s: string, i: number) => (
                      <Chip
                        key={i}
                        label={s}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: "999px",
                          borderColor: isDark
                            ? "rgba(148,163,184,0.35)"
                            : "rgba(59,130,246,0.35)",
                          color: isDark ? "#cbd5e1" : "#1f2937",
                          "&:hover": {
                            borderColor: isDark
                              ? "rgba(148,163,184,0.6)"
                              : "rgba(59,130,246,0.6)",
                          },
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

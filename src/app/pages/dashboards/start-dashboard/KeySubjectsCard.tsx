"use client";
import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  useTheme,
  Box,
  IconButton,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { LearningDashboard } from "../../../../types/LearningDashboard";
import { useHistory } from "react-router-dom";
import { KTSVG } from "../../../../_start/helpers/components/KTSVG";
/* ------------------ Helpers ------------------ */
function extractScoresForSubject(
  dashboard: LearningDashboard,
  subjectName: string
): { tx: number; gk: number; ck: number } {
  const fromImportant = dashboard?.importantSubjects?.subjects?.[subjectName];
  if (fromImportant) {
    return {
      tx:
        fromImportant["Thường xuyên"] ??
        fromImportant["TX"] ??
        fromImportant["thuongxuyen"] ??
        0,
      gk: fromImportant["Giữa kỳ"] ?? fromImportant["GK"] ?? 0,
      ck: fromImportant["Cuối kỳ"] ?? fromImportant["CK"] ?? 0,
    };
  }

  const found = (dashboard?.subjectInsights || []).find(
    (s) =>
      (s?.subjectName || "").toString().toLowerCase() ===
      subjectName.toLowerCase()
  );
  if (found) {
    const src =
      found.scores || found.marks || found.examScores || found.results || {};
    const tx =
      src["Thường xuyên"] ??
      src["TX"] ??
      src["thuongxuyen"] ??
      src["continuous"] ??
      0;
    const gk = src["Giữa kỳ"] ?? src["GK"] ?? src["midterm"] ?? 0;
    const ck = src["Cuối kỳ"] ?? src["CK"] ?? src["final"] ?? 0;
    return { tx: Number(tx) || 0, gk: Number(gk) || 0, ck: Number(ck) || 0 };
  }

  return { tx: 0, gk: 0, ck: 0 };
}

function currentAverageFromDashboard(
  dashboard: LearningDashboard,
  subjectName: string
): number {
  const { tx, gk, ck } = extractScoresForSubject(dashboard, subjectName);
  const weighted = tx * 0.2 + gk * 0.3 + ck * 0.5;
  return Math.round((weighted + Number.EPSILON) * 100) / 100;
}

/* ------------------ Component ------------------ */

type KeySubjectsCardProps = {
  selectedDashboard?: LearningDashboard | null;
};

const KeySubjectsCard: React.FC<KeySubjectsCardProps> = ({ selectedDashboard }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const history = useHistory();

  const { subjectsData, anyFallback } = useMemo(() => {
    if (!selectedDashboard) return { subjectsData: [], anyFallback: false };

    const data: Array<{
      subject: string;
      "Thường xuyên": number;
      "Giữa kỳ": number;
      "Cuối kỳ": number;
    }> = [];

    const subjectNames = Object.keys(
      selectedDashboard.importantSubjects?.subjects || {}
    );

    (subjectNames || []).forEach((name) => {
      const { tx, gk, ck } = extractScoresForSubject(selectedDashboard, name);
      data.push({
        subject: name,
        "Thường xuyên": tx,
        "Giữa kỳ": gk,
        "Cuối kỳ": ck,
      });
    });

    return {
      subjectsData: data,
      anyFallback: subjectNames.length === 0,
    };
  }, [selectedDashboard]);

  if (!selectedDashboard)
    return (
      <Card
        sx={{
          borderRadius: "20px",
          p: 2.5,
          background: isDark
            ? "linear-gradient(135deg, #312e81 0%, #581c87 100%)"
            : "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
          border: `1px solid ${
            isDark ? "rgba(236,72,153,0.25)" : "rgba(244,114,182,0.25)"
          }`,
          boxShadow: isDark
            ? "0 6px 16px rgba(236,72,153,0.35)"
            : "0 6px 16px rgba(236,72,153,0.15)",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: isDark ? "#f9a8d4" : "#ec4899",
              mb: 1,
            }}
          >
            🎯 Các môn chủ chốt
          </Typography>
          <Typography color="text.secondary">
            Chưa có dữ liệu học tập.
          </Typography>
        </CardContent>
      </Card>
    );

  return (
    <Card
      sx={{
        borderRadius: "20px",
        background: isDark
          ? "linear-gradient(135deg, #42275a 0%, #734b6d 100%)"
          : "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
        boxShadow: isDark
          ? "0 8px 20px rgba(244,114,182,0.35)"
          : "0 8px 20px rgba(244,114,182,0.2)",
        p: 2.5,
        border: `1px solid ${
          isDark ? "rgba(244,114,182,0.3)" : "rgba(244,114,182,0.25)"
        }`,
        transition: "box-shadow 0.3s ease, transform 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isDark
            ? "0 12px 28px rgba(244,114,182,0.5)"
            : "0 12px 28px rgba(244,114,182,0.35)",
        },
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Tiêu đề + Nút điều hướng */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: isDark ? "#f9a8d4" : "#ec4899",
            }}
          >
            🎯 Các môn chủ chốt
          </Typography>

          <button
            type="button"
            className="btn btn-sm btn-icon btn-color-primary btn-active-light-primary"
            onClick={() => history.push("/vireya/danh-gia-trinh-do")}
          >
            <KTSVG
              path="/media/icons/duotone/Navigation/Arrow-right.svg"
              className="svg-icon-1"
            />
          </button>
        </Box>

        {subjectsData.length > 0 ? (
          <div className="ld-infobox">
            <div className="ld-chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={subjectsData}
                  margin={{ top: 18, right: 20, left: 0, bottom: 6 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#fbcfe8" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="Thường xuyên" fill="#93c5fd" />
                  <Bar dataKey="Giữa kỳ" fill="#fde68a" />
                  <Bar dataKey="Cuối kỳ" fill="#c7d2fe" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {anyFallback && (
              <div className="ld-fallback-note">
                Một số môn chưa có dữ liệu. Biểu đồ đang hiển thị mặc định 0.
              </div>
            )}

            <div
              className="ld-rows3"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              {[
                {
                  title: "Điểm mạnh",
                  text:
                    selectedDashboard.importantSubjects?.overallStrengths ||
                    "Chưa có dữ liệu",
                },
                {
                  title: "Điểm yếu",
                  text:
                    selectedDashboard.importantSubjects?.overallWeaknesses ||
                    "Chưa có dữ liệu",
                },
                {
                  title: "Chiến lược",
                  text:
                    selectedDashboard.importantSubjects?.learningAdvice ||
                    "Chưa có dữ liệu",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="ld-col"
                  style={{
                    border: isDark
                      ? "1px solid rgba(244,114,182,0.25)"
                      : "1px solid rgba(244,114,182,0.2)",
                    borderRadius: "12px",
                    padding: "10px 12px",
                    background: isDark ? "#2e1f3f" : "#fff0f6",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div
                    className="ld-col-title"
                    style={{
                      fontWeight: 700,
                      color: isDark ? "#f9a8d4" : "#ec4899",
                      marginBottom: "6px",
                    }}
                  >
                    <strong>{item.title}</strong>
                  </div>
                  <div className="ld-col-text">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Typography
            sx={{
              fontStyle: "italic",
              color: isDark ? "#e5e7eb" : "#6b7280",
            }}
          >
            Chưa có dữ liệu để hiển thị.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default KeySubjectsCard;

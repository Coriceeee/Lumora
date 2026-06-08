import React from "react";
import { Box, Typography } from "@mui/material";
import { CareerFuture } from "../utils/PathFinderEngine";

interface Props {
  forecasts: CareerFuture[];
  message?: string;
}

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  background: "linear-gradient(135deg, #fff7ed, #ffffff)",
  boxShadow: "0 12px 35px rgba(249,115,22,0.12)",
  border: "1px solid rgba(249,115,22,0.16)",
  marginBottom: 24,
};

const getLevelText = (probability: number): string => {
  if (probability >= 85) return "Rất nổi bật";
  if (probability >= 70) return "Tiềm năng tốt";
  if (probability >= 50) return "Có thể phát triển";
  return "Cần củng cố thêm";
};

const CareerPathForecastCard: React.FC<Props> = ({
  forecasts,
  message,
}) => {
  if (!forecasts || forecasts.length === 0) {
    return (
      <div className="card p-4" style={cardStyle}>
        <Typography sx={{ fontWeight: 900, fontSize: 22, mb: 1 }}>
          🔭 Dự báo hướng phát triển nghề nghiệp
        </Typography>

        <Typography sx={{ color: "#555" }}>
          Chưa đủ dữ liệu học tập để dự báo quỹ đạo phát triển nghề nghiệp.
        </Typography>
      </div>
    );
  }

  return (
    <div className="card p-4" style={cardStyle}>
      <Typography sx={{ fontWeight: 900, fontSize: 22, mb: 1 }}>
        🔭 Dự báo hướng phát triển nghề nghiệp
      </Typography>

      <Typography sx={{ color: "#555", mb: 2 }}>
        Dự báo các hướng nghề nghiệp có khả năng phát triển nổi bật dựa trên
        điểm học tập thật, ma trận yêu cầu ngành nghề và Career Readiness Engine.
      </Typography>

      {message && (
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: "#ffedd5",
            border: "1px solid rgba(249,115,22,0.25)",
            mb: 2,
          }}
        >
          <Typography sx={{ fontWeight: 800, color: "#c2410c" }}>
            Nhận định chính
          </Typography>

          <Typography sx={{ mt: 0.5, color: "#444" }}>
            {message}
          </Typography>
        </Box>
      )}

      {forecasts.slice(0, 5).map((career, index) => (
        <Box
          key={`${career.careerName}-${index}`}
          sx={{
            p: 2,
            mb: 1.5,
            borderRadius: 3,
            background: "#fff",
            border:
              index === 0
                ? "2px solid rgba(249,115,22,0.55)"
                : "1px solid #e5e7eb",
            boxShadow:
              index === 0
                ? "0 8px 18px rgba(249,115,22,0.12)"
                : "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>
              {index + 1}. {career.careerName}
              {index === 0 && (
                <span style={{ color: "#f97316", marginLeft: 8 }}>
                  ⭐ nổi bật nhất
                </span>
              )}
            </Typography>

            <Typography sx={{ fontWeight: 900, color: "#c2410c" }}>
              {career.probability}%
            </Typography>
          </Box>

          <Box
            sx={{
              height: 10,
              borderRadius: 999,
              background: "#fed7aa",
              overflow: "hidden",
              mb: 1,
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${career.probability}%`,
                borderRadius: 999,
                background: "#f97316",
              }}
            />
          </Box>

          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.5 }}>
            Mức dự báo: {getLevelText(career.probability)}
          </Typography>

          {career.keyFactors.length > 0 && (
            <Typography sx={{ fontSize: 14, color: "#555" }}>
              ✅ Yếu tố nổi bật: {career.keyFactors.join(", ")}
            </Typography>
          )}

          {career.weakFactors.length > 0 && (
            <Typography sx={{ fontSize: 14, color: "#555" }}>
              ⚠️ Cần củng cố: {career.weakFactors.join(", ")}
            </Typography>
          )}
        </Box>
      ))}
    </div>
  );
};

export default CareerPathForecastCard;
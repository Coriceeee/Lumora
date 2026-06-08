// FILE: src/app/pages/neovana/components_dinhhuong/CareerSimulationCard.tsx

import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { CareerSimulation } from "../utils/CareerReadinessEngine";

interface Props {
  simulations: CareerSimulation[];
  careerName: string;
}

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
  boxShadow: "0 12px 35px rgba(79,70,229,0.12)",
  border: "1px solid rgba(79,70,229,0.16)",
  marginBottom: 24,
};

const CareerSimulationCard: React.FC<Props> = ({
  simulations,
  careerName,
}) => {
  const topSimulations = useMemo(() => {
    return [...(simulations || [])]
      .filter((item) => item.impact > 0)
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3);
  }, [simulations]);

  if (!topSimulations.length) return null;

  const best = topSimulations[0];

  return (
    <div className="card p-4" style={cardStyle}>
      <Typography sx={{ fontWeight: 900, fontSize: 22, mb: 1 }}>
        🔮 Mô phỏng lộ trình nghề nghiệp
      </Typography>

      <Typography sx={{ color: "#555", mb: 2 }}>
        Hệ thống mô phỏng tác động của việc cải thiện từng môn học đến mức độ
        sẵn sàng với ngành <strong>{careerName}</strong>.
      </Typography>

      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          background: "#eef2ff",
          border: "1px solid rgba(79,70,229,0.25)",
          mb: 2,
        }}
      >
        <Typography sx={{ fontWeight: 800, color: "#4f46e5" }}>
          Môn có tác động lớn nhất: {best.subject}
        </Typography>

        <Typography sx={{ mt: 0.5 }}>
          Nếu cải thiện <strong>{best.subject}</strong> thêm{" "}
          <strong>{best.improveBy}</strong> điểm, CRS có thể tăng từ{" "}
          <strong>{best.oldReadinessScore}%</strong> lên{" "}
          <strong>{best.newReadinessScore}%</strong>.
        </Typography>
      </Box>

      {topSimulations.map((simulation, index) => (
        <Box
          key={`${simulation.subject}-${index}`}
          sx={{
            p: 2,
            mb: 1.5,
            borderRadius: 3,
            background: "#fff",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Typography sx={{ fontWeight: 800 }}>
            {index + 1}. Cải thiện {simulation.subject}
          </Typography>

          <Typography sx={{ mt: 0.5, color: "#555" }}>
            {simulation.oldReadinessScore}% →{" "}
            <strong>{simulation.newReadinessScore}%</strong>{" "}
            <span style={{ color: "#16a34a", fontWeight: 800 }}>
              (+{simulation.impact}%)
            </span>
          </Typography>
        </Box>
      ))}
    </div>
  );
};

export default CareerSimulationCard;
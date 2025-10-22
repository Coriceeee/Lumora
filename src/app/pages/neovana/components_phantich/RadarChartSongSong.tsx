// src/app/pages/neovana/components_phantich/RadarChartSongSong.tsx
import * as React from "react";
import { Box } from "@mui/material";
import { Radar } from "react-chartjs-2";
import "chart.js/auto";

interface RadarDataSet {
  labels: string[];
  values: number[];
}

interface Props {
  subjectsData: RadarDataSet;       // Môn học (0-10)
  skillsCertsData: RadarDataSet;    // Kỹ năng & Chứng chỉ (0-100)
}

const RadarChartSongSong: React.FC<Props> = ({ subjectsData, skillsCertsData }) => {
  const optionsSubjects = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: function (ctx: any) {
            return `${ctx.dataset.label}: ${ctx.raw}`;
          },
        },
      },
    },
    scales: { r: { min: 0, max: 10, ticks: { stepSize: 1 } } },
  };

  const optionsSkillsCerts = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: function (ctx: any) {
            return `${ctx.dataset.label}: ${ctx.raw}`;
          },
        },
      },
    },
    scales: { r: { min: 0, max: 100, ticks: { stepSize: 10 } } },
  };

  const dataSubjects = {
    labels: subjectsData.labels,
    datasets: [
      {
        label: "Môn học",
        data: subjectsData.values,
        fill: true,
        backgroundColor: "rgba(255, 152, 0, 0.2)",
        borderColor: "rgba(255, 152, 0, 1)",
        borderWidth: 1,
        pointBackgroundColor: "rgba(255, 152, 0, 1)",
      },
    ],
  };

  const dataSkillsCerts = {
    labels: skillsCertsData.labels,
    datasets: [
      {
        label: "Kỹ năng",
        data: skillsCertsData.values.slice(0, skillsCertsData.values.length / 2),
        fill: true,
        backgroundColor: "rgba(63, 81, 181, 0.2)",
        borderColor: "rgba(63, 81, 181, 1)",
        borderWidth: 1,
        pointBackgroundColor: "rgba(63, 81, 181, 1)",
      },
      {
        label: "Chứng chỉ",
        data: skillsCertsData.values.slice(skillsCertsData.values.length / 2),
        fill: true,
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderColor: "rgba(76, 175, 80, 1)",
        borderWidth: 1,
        pointBackgroundColor: "rgba(76, 175, 80, 1)",
      },
    ],
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 4 }}>
      {/* Radar Môn học */}
      <Box sx={{ flex: "1 1 48%", minWidth: 300, py: 3, bgcolor: "#f5f5f5", borderRadius: 3 }}>
        <Radar data={dataSubjects} options={optionsSubjects} />
      </Box>

      {/* Radar Kỹ năng & Chứng chỉ */}
      <Box sx={{ flex: "1 1 48%", minWidth: 300, py: 3, bgcolor: "#f5f5f5", borderRadius: 3 }}>
        <Radar data={dataSkillsCerts} options={optionsSkillsCerts} />
      </Box>
    </Box>
  );
};

export default RadarChartSongSong;

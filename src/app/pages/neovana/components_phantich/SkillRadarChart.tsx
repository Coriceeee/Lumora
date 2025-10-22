// src/app/pages/neovana/components_phantich/SkillRadarChart.tsx
import * as React from "react";
import { Radar } from "react-chartjs-2";
import "chart.js/auto"; // tự register tất cả component cần thiết

interface RadarChartData {
  labels: string[];
  values: number[];
}

interface Props {
  data: RadarChartData;
}

const SkillRadarChart: React.FC<Props> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Kỹ năng, Chứng chỉ, Điểm số",
        data: data.values,
        fill: true,
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 1,
        pointBackgroundColor: "rgba(0, 123, 255, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (ctx: any) {
            return `${ctx.dataset.label}: ${ctx.raw}`;
          },
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100, // hoặc 10 nếu thang điểm 0-10
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return <Radar data={chartData} options={options} />;
};

export default SkillRadarChart;

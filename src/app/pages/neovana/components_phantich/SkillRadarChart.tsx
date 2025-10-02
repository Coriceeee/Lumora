import * as React from "react";
import { Radar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js";

interface RadarChartData {
  labels: string[];
  values: number[];
}

const RadarChart: React.FC<{ data: RadarChartData }> = ({ data }) => {
  debugger;
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
      },
    ],
  };

  return <Radar data={chartData} />;
};

export default RadarChart;

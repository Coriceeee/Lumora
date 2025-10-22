import React from "react";
import { useAyura, EmotionPoint } from "../AyuraCoreProvider";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const EmotionChartComponent: React.FC = () => {
  const { state } = useAyura();
  const data = state.timeline.map((p: EmotionPoint) => ({
    x: new Date(p.ts * 1000).toLocaleDateString(),
    y: p.score,
  }));

  return (
    <div className="p-4 border rounded-2xl bg-white/70 shadow-md">
      <h3 className="text-lg font-semibold mb-2">📊 Biểu đồ cảm xúc</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="x" hide />
          <YAxis domain={[-100, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="y" stroke="#ff3366" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

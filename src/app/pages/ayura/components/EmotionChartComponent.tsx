import React from 'react';
import { useAyuraCore } from '../AyuraCoreProvider';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export const EmotionChartComponent: React.FC = () => {
  const { chartData } = useAyuraCore();

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Emotional Chart (Last {chartData.length} days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Line type="monotone" dataKey="valence" stroke="#8884d8" name="Valence" />
          <Line type="monotone" dataKey="calmness" stroke="#82ca9d" name="Calmness" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

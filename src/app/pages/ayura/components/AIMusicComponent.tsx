import React from 'react';
import { useAyuraCore } from '../AyuraCoreProvider';

export const AIMusicComponent: React.FC = () => {
  const { chartData } = useAyuraCore();
  if (!chartData.length) {
    return (
      <div className="p-4 bg-blue-50 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">AI Music Suggestion</h2>
        <p>No data to generate music profile yet.</p>
      </div>
    );
  }
  // Tính trung bình valence và calmness
  const avgValence = chartData.reduce((sum, d) => sum + d.valence, 0) / chartData.length;
  const avgCalmness = chartData.reduce((sum, d) => sum + d.calmness, 0) / chartData.length;
  const tempo = Math.round(60 + (1 - avgCalmness) * 60); // 60-120 BPM
  const tone = avgValence >= 0.5 ? 'Major' : 'Minor';

  return (
    <div className="p-4 bg-blue-50 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">AI Music Suggestion</h2>
      <p><strong>Tempo:</strong> {tempo} BPM</p>
      <p><strong>Mode:</strong> C {tone}</p>
      <p><strong>Suggested Elements:</strong> Smooth ambient pads, gentle percussion</p>
      <p className="mt-2 text-sm text-gray-600">
        Based on your recent emotional profile, an ambient track in {tone} mode at around {tempo} BPM might suit your mood.
      </p>
    </div>
  );
};

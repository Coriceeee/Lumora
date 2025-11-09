import React, { createContext, useContext, useState } from 'react';

interface EmotionData {
  valence: number;
  arousal: number;
  calmness: number;
  score: number;
}

interface MaterialData {
  water: number;
  leaf: number;
  sun: number;
  flower: number;
}

interface ChartDataPoint {
  date: string;
  valence: number;
  calmness: number;
}

interface AyuraCoreContextType {
  emotion: EmotionData;
  materials: MaterialData;
  chartData: ChartDataPoint[];
  addJournalEntry: (text: string) => void;
  meditate: () => void;
  expressGratitude: () => void;
}

const AyuraCoreContext = createContext<AyuraCoreContextType | undefined>(undefined);

export const AyuraCoreProvider: React.FC = ({ children }) => {
  const [emotion, setEmotion] = useState<EmotionData>({
    valence: 0,
    arousal: 0,
    calmness: 0,
    score: 0
  });
  const [materials, setMaterials] = useState<MaterialData>({
    water: 0,
    leaf: 0,
    sun: 0,
    flower: 0
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const analyzeTextToEmotion = (text: string): EmotionData => {
    // Placeholder: mô phỏng phân tích cảm xúc từ text
    const valence = Math.min(1, Math.max(0, (text.length % 10) / 10));
    const arousal = Math.min(1, Math.max(0, (text.split('!').length - 1) / 5));
    const calmness = Math.min(1, Math.max(0, (5 - (text.length % 5)) / 5));
    const score = (valence + calmness - arousal) / 2;
    return { valence, arousal, calmness, score };
  };

  const addJournalEntry = (text: string) => {
    const newEmotion = analyzeTextToEmotion(text);
    setEmotion(newEmotion);

    // Viết nhật ký => +1 nước (water)
    setMaterials(prev => ({
      ...prev,
      water: prev.water + 1
    }));

    // Cập nhật dữ liệu chart
    const today = new Date().toLocaleDateString();
    setChartData(prev => {
      const updated = [...prev];
      const existing = updated.find(d => d.date === today);
      if (existing) {
        existing.valence = newEmotion.valence;
        existing.calmness = newEmotion.calmness;
      } else {
        updated.push({ date: today, valence: newEmotion.valence, calmness: newEmotion.calmness });
      }
      if (updated.length > 30) {
        updated.shift(); // chỉ giữ tối đa 30 ngày
      }
      return updated;
    });
  };

  const meditate = () => {
    // Thiền => +1 lá (leaf), tăng nhẹ calmness
    setMaterials(prev => ({ ...prev, leaf: prev.leaf + 1 }));
    setEmotion(prev => ({ ...prev, calmness: Math.min(1, prev.calmness + 0.1) }));
  };

  const expressGratitude = () => {
    // Biết ơn => +1 mặt trời (sun), tăng nhẹ valence
    setMaterials(prev => ({ ...prev, sun: prev.sun + 1 }));
    setEmotion(prev => ({ ...prev, valence: Math.min(1, prev.valence + 0.1) }));
  };

  return (
    <AyuraCoreContext.Provider value={{
      emotion,
      materials,
      chartData,
      addJournalEntry,
      meditate,
      expressGratitude
    }}>
      {children}
    </AyuraCoreContext.Provider>
  );
};

export const useAyuraCore = () => {
  const context = useContext(AyuraCoreContext);
  if (!context) {
    throw new Error('useAyuraCore must be used within an AyuraCoreProvider');
  }
  return context;
};

import React from 'react';
import { HealingJournalComponent } from '../../pages/ayura/components/HealingJournalComponent';
import { EmotionalMaterialsComponent } from '../../pages/ayura/components/EmotionalMaterialsComponent';
import { HealingTreeComponent } from '../../pages/ayura/components/HealingTreeComponent';
import { EmotionChartComponent } from '../../pages/ayura/components/EmotionChartComponent';
import { AIMusicComponent } from '../../pages/ayura/components/AIMusicComponent';

export const MindfulGardenComponent: React.FC = () => {
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🌳 Ayura Mindful Garden 🌼</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cột trái: Materials và Journal */}
        <div className="space-y-4">
          <EmotionalMaterialsComponent />
          <HealingJournalComponent />
        </div>
        {/* Cột giữa: Cây 3D */}
        <HealingTreeComponent size={1.5} density={8} />
        {/* Cột phải: Biểu đồ và Âm nhạc */}
        <div className="space-y-4">
          <EmotionChartComponent />
          <AIMusicComponent />
        </div>
      </div>
    </div>
  );
};

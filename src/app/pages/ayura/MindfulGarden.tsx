import React from "react";
import { HealingTreeComponent } from "./componets/HealingTreeComponent";
import { HealingJournalComponent } from "./componets/HealingJournalComponent";
import { EmotionalMaterialsComponent } from "./componets/EmotionalMaterialsComponent";
import { EmotionChartComponent } from "./componets/EmotionChartComponent";
import { AIMusicComponent } from "./componets/AIMusicComponent";

export const MindfulGardenComponent = () => (
  <div className="relative w-full h-[400px] bg-gradient-to-b from-blue-100 to-green-50 rounded-3xl overflow-hidden shadow-lg">
    <div className="absolute left-10 bottom-0"><HealingTreeComponent /></div>
    <div className="absolute right-6 top-6 w-[280px] space-y-3">
      <HealingJournalComponent />
      <EmotionalMaterialsComponent />
    </div>
    <div className="absolute left-10 top-4 w-[320px]"><EmotionChartComponent /></div>
    <div className="absolute right-6 bottom-4"><AIMusicComponent /></div>
  </div>
);

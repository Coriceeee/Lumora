import React from "react";
import { AyuraCoreProvider } from "./AyuraCoreProvider";
import { HealingGardenScene } from "./components/HealingGardenScene";

const MindfulGarden: React.FC = () => {
  return (
    <AyuraCoreProvider>
      <div className="h-screen w-screen bg-[#fdfcf9] flex items-center justify-center">
        <div className="h-[720px] w-[1200px]">
          <HealingGardenScene />
        </div>
      </div>
    </AyuraCoreProvider>
  );
};

export default MindfulGarden;

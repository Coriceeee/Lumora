import React from "react";
import { useAyura, Material } from "../AyuraCoreProvider";

export const EmotionalMaterialsComponent: React.FC = () => {
  const { state, generateMaterial, applyMaterial } = useAyura();

  const activities = [
    { key: "journal", label: "💧 Giọt chân thật" },
    { key: "meditation", label: "🌿 Hơi thở sáng" },
    { key: "gratitude", label: "☀️ Ánh nắng dịu dàng" },
    { key: "sharing", label: "🌸 Hạt giống hiểu mình" },
  ] as const;

  return (
    <div className="p-4 border rounded-2xl bg-white/70 shadow-md">
      <h3 className="text-lg font-semibold mb-2">🌈 Nguyên liệu cảm xúc</h3>
      <div className="flex flex-wrap gap-2">
        {activities.map((a) => (
          <button
            key={a.key}
            onClick={() => generateMaterial(a.key as any)}
            className="rounded-xl border px-3 py-2 hover:bg-green-50 transition"
          >
            {a.label}
          </button>
        ))}
      </div>
      <div className="mt-3">
        {state.materials.slice(-5).map((m: Material) => (
          <button
            key={m.id}
            onClick={() => applyMaterial(m.id)}
            className="mr-2 mt-2 rounded-lg bg-orange-50 px-3 py-1 hover:bg-orange-100"
          >
            Tưới {m.label} (+{m.energy})
          </button>
        ))}
      </div>
    </div>
  );
};

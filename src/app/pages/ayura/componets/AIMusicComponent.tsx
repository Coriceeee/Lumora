import React from "react";
import { useAyura, MusicMeta } from "../AyuraCoreProvider";

export const AIMusicComponent: React.FC = () => {
  const { state, renderMonthlyMusic } = useAyura();
  const items = Object.values(state.music as Record<string, MusicMeta>);

  return (
    <div className="p-4 border rounded-2xl bg-white/70 shadow-md">
      <h3 className="text-lg font-semibold mb-2">🎧 Nhạc chữa lành cá nhân</h3>
      <button
        onClick={() => renderMonthlyMusic()}
        className="rounded-xl border px-3 py-2 hover:bg-purple-50 transition"
      >
        Tạo nhạc tháng này
      </button>
      <ul className="mt-3 text-sm">
        {items.map((m: MusicMeta) => (
          <li key={m.monthId} className="mt-1">
            {m.monthId} • {m.solfeggio}Hz • {m.tempo} BPM • key {m.key}
          </li>
        ))}
      </ul>
    </div>
  );
};

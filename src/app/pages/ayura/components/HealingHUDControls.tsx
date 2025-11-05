import { useAyura } from "../AyuraCoreProvider";

export const HealingHUDControls = () => {
  const { state, dispatch } = useAyura();
  return (
    <div className="absolute left-3 top-3 p-3 rounded-xl backdrop-blur bg-white/60 shadow-sm flex flex-col gap-2 text-sm">
      <div className="font-semibold">AYURA · Phượng Voxel 3D</div>
      {(["Valence", "Arousal", "Calmness"] as const).map((label, idx) => (
        <div key={label} className="flex items-center gap-2">
          <label className="opacity-70 w-20">{label}</label>
          <input
            type="range"
            min={idx === 2 ? 0 : -1}
            max={1}
            step={0.01}
            value={(state as any)[label.toLowerCase()]}
            onChange={(e) =>
              dispatch({ type: `SET_${label.toUpperCase()}` as any, payload: parseFloat(e.target.value) })
            }
          />
        </div>
      ))}
    </div>
  );
};

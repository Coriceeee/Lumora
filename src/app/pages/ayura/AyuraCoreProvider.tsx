import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";

// =============================
// Type definitions
// =============================
export type UID = string;
export type Timestamp = number;
export type EmotionLabel =
  | "calm"
  | "joy"
  | "hope"
  | "sad"
  | "anger"
  | "stress"
  | "neutral";

export type Emotion = {
  valence: number;
  arousal: number;
  label: EmotionLabel;
  confidence?: number;
};

export type MaterialKind =
  | "truth_drop"
  | "bright_breath"
  | "gentle_sun"
  | "self_seed";

export type Material = {
  id: string;
  kind: MaterialKind;
  label: string;
  energy: number;
  ts: Timestamp;
  consumed?: boolean;
};

export type TreeState = {
  level: number;
  leaves: number;
  flowers: number;
  streakDays: number;
  lastUpdated: Timestamp;
};

export type EmotionPoint = {
  ts: Timestamp;
  score: number;
  label: EmotionLabel;
};

export type MusicMeta = {
  monthId: string;
  url?: string;
  solfeggio?: number;
  tempo?: number;
  key?: string;
};

// =============================
// Utility functions
// =============================
const now = (): Timestamp => Math.floor(Date.now() / 1000);
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
const monthId = (ts: Timestamp = now()) => {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const uid = () => Math.random().toString(36).slice(2);

// Emotion → score (-100..100)
function emotionToScore(e: Emotion): number {
  const bias: Record<EmotionLabel, number> = {
    calm: 0.05,
    joy: 0.1,
    hope: 0.06,
    sad: -0.08,
    anger: -0.12,
    stress: -0.1,
    neutral: 0,
  };
  return Math.round(
    clamp((e.valence * 0.7 - e.arousal * 0.2 + (bias[e.label] ?? 0)) * 100, -100, 100)
  );
}

// =============================
// Local Storage persistence
// =============================
const STORAGE_KEY = "AYURA_CORE_STATE_V1";

export type AyuraState = {
  materials: Material[];
  tree: TreeState;
  timeline: EmotionPoint[];
  music: Record<string, MusicMeta>;
};

const initialState: AyuraState = {
  materials: [],
  tree: { level: 1, leaves: 0, flowers: 0, streakDays: 0, lastUpdated: now() },
  timeline: [],
  music: {},
};

function loadState(): AyuraState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AyuraState) : null;
  } catch {
    return null;
  }
}

function saveState(s: AyuraState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

// =============================
// Reducer
// =============================
export type Action =
  | { type: "ADD_MATERIALS"; payload: Material[] }
  | { type: "UPDATE_TREE"; payload: Partial<TreeState> }
  | { type: "ADD_TIMELINE_POINT"; payload: EmotionPoint }
  | { type: "SET_MUSIC"; payload: MusicMeta }
  | { type: "RESET" };

function reducer(state: AyuraState, a: Action): AyuraState {
  switch (a.type) {
    case "ADD_MATERIALS": {
      const next: AyuraState = {
        ...state,
        materials: [...state.materials, ...a.payload],
      };
      saveState(next);
      return next;
    }

    case "UPDATE_TREE": {
      const next: AyuraState = {
        ...state,
        tree: { ...state.tree, ...a.payload, lastUpdated: now() },
      };
      saveState(next);
      return next;
    }

    case "ADD_TIMELINE_POINT": {
      const next: AyuraState = {
        ...state,
        timeline: [...state.timeline, a.payload],
      };
      saveState(next);
      return next;
    }

    case "SET_MUSIC": {
      const next: AyuraState = {
        ...state,
        music: { ...state.music, [a.payload.monthId]: a.payload },
      };
      saveState(next);
      return next;
    }

    case "RESET": {
      saveState(initialState);
      return initialState;
    }

    default:
      return state;
  }
}

// =============================
// Context
// =============================
export type AyuraContextType = {
  state: AyuraState;
  analyzeEmotion: (text: string) => Promise<Emotion>;
  generateMaterial: (
    activity: "journal" | "meditation" | "gratitude" | "sharing"
  ) => Material;
  applyMaterial: (materialId: string) => Promise<TreeState>;
  renderMonthlyMusic: () => Promise<MusicMeta>;
  reset: () => void;
};

const AyuraContext = createContext<AyuraContextType | null>(null);

export const useAyura = () => {
  const ctx = useContext(AyuraContext);
  if (!ctx)
    throw new Error("useAyura must be used within <AyuraCoreProvider />");
  return ctx;
};

// =============================
// Provider
// =============================
export const AyuraCoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, loadState() ?? initialState);

  // -------- analyzeEmotion --------
  const analyzeEmotion = useCallback(async (text: string): Promise<Emotion> => {
    const lower = text.toLowerCase();
    const label: EmotionLabel =
      lower.includes("vui") || lower.includes("hạnh phúc")
        ? "joy"
        : lower.includes("bình") || lower.includes("an")
        ? "calm"
        : lower.includes("buồn")
        ? "sad"
        : lower.includes("hy vọng")
        ? "hope"
        : "neutral";

    const emotion: Emotion = {
      valence: label === "joy" ? 0.7 : label === "sad" ? -0.4 : 0.3,
      arousal: label === "calm" ? 0.3 : 0.5,
      label,
    };

    const score = emotionToScore(emotion);
    const point: EmotionPoint = { ts: now(), score, label };
    dispatch({ type: "ADD_TIMELINE_POINT", payload: point });
    return emotion;
  }, []);

  // -------- generateMaterial --------
  const generateMaterial = useCallback(
    (
      activity: "journal" | "meditation" | "gratitude" | "sharing"
    ): Material => {
      const map = {
        journal: { kind: "truth_drop", label: "Giọt chân thật", energy: 5 },
        meditation: { kind: "bright_breath", label: "Hơi thở sáng", energy: 7 },
        gratitude: { kind: "gentle_sun", label: "Ánh nắng dịu dàng", energy: 10 },
        sharing: { kind: "self_seed", label: "Hạt giống hiểu mình", energy: 12 },
      };
      const m: Material = { ...map[activity], id: uid(), ts: now() } as Material;
      dispatch({ type: "ADD_MATERIALS", payload: [m] });
      return m;
    },
    []
  );

  // -------- applyMaterial --------
  const applyMaterial = useCallback(
    async (materialId: string): Promise<TreeState> => {
      const m = state.materials.find((x) => x.id === materialId);
      const deltaLeaves = m ? Math.ceil(m.energy / 5) : 1;
      const next = {
        leaves: state.tree.leaves + deltaLeaves,
        flowers: state.tree.flowers + (m?.kind === "gentle_sun" ? 1 : 0),
        level: Math.min(10, state.tree.level + 1),
      };
      dispatch({ type: "UPDATE_TREE", payload: next });
      return { ...state.tree, ...next, lastUpdated: now() };
    },
    [state.materials, state.tree]
  );

  // -------- renderMonthlyMusic --------
  const renderMonthlyMusic = useCallback(async (): Promise<MusicMeta> => {
    const m = monthId();
    const avg =
      state.timeline.reduce((s, p) => s + p.score, 0) /
      Math.max(1, state.timeline.length);
    const dominant: EmotionLabel =
      avg > 30 ? "joy" : avg > 5 ? "calm" : avg < -20 ? "sad" : "neutral";
    const solfeggio =
      dominant === "joy" ? 639 : dominant === "calm" ? 528 : 396;
    const meta: MusicMeta = {
      monthId: m,
      url: `/audio/ayura_${m}.mp3`,
      solfeggio,
      tempo: 60,
      key: "C",
    };
    dispatch({ type: "SET_MUSIC", payload: meta });
    return meta;
  }, [state.timeline]);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const value = useMemo<AyuraContextType>(
    () => ({
      state,
      analyzeEmotion,
      generateMaterial,
      applyMaterial,
      renderMonthlyMusic,
      reset,
    }),
    [
      state,
      analyzeEmotion,
      generateMaterial,
      applyMaterial,
      renderMonthlyMusic,
      reset,
    ]
  );

  return (
    <AyuraContext.Provider value={value}>{children}</AyuraContext.Provider>
  );
};

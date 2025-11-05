import React, { createContext, useContext, useReducer } from "react";

type EmotionState = { valence: number; arousal: number; calmness: number };
type Action =
  | { type: "SET_VALENCE"; payload: number }
  | { type: "SET_AROUSAL"; payload: number }
  | { type: "SET_CALMNESS"; payload: number };

const AyuraContext = createContext<{ state: EmotionState; dispatch: React.Dispatch<Action> } | null>(null);

function reducer(state: EmotionState, action: Action): EmotionState {
  switch (action.type) {
    case "SET_VALENCE": return { ...state, valence: action.payload };
    case "SET_AROUSAL": return { ...state, arousal: action.payload };
    case "SET_CALMNESS": return { ...state, calmness: action.payload };
    default: return state;
  }
}

export const AyuraCoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { valence: 0.2, arousal: 0.25, calmness: 0.8 });
  return <AyuraContext.Provider value={{ state, dispatch }}>{children}</AyuraContext.Provider>;
};

export const useAyura = () => {
  const ctx = useContext(AyuraContext);
  if (!ctx) throw new Error("useAyura must be used within AyuraCoreProvider");
  return ctx;
};

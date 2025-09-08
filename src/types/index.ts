export interface Course {
  title: string;
  weeks: number;
  matching?: number;
}

export interface Skill {
  id: string;
  name: string;
  score: number;
  confidence: number;
  sources?: string[];
  history?: number[];
  courses?: Course[];
  radius?: number;
  x?: number;
  y?: number;
}

export interface Goal {
  id: string;
  title: string;
  relatedSkills: string[];
}

export interface AiAnalysis {
  summary: string;
  weeks: number;
  needed: number;
}

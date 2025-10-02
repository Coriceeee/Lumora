// src/types/GeminiResults.ts

export interface SkillEvaluation {
  name: string;
  currentScore: number;
  relevance: number;
  fitLevel: string;
  comment: string;
}

export interface CertificateEvaluation {
  name: string;
  currentScore: number;
  relevance: number;
  fitLevel: string;
  comment: string;
}

export interface SubjectEvaluation {
  subjectName: string;
  currentAvg: number;
  relevance: number;
  fitLevel: string;
  comment: string;
}

export interface SkillSuggestions {
  name: string;
  has: boolean;
  relevance: number;
  fitLevel: string;
  comment: string;
}

export interface CertificateSuggestions {
  name: string;
  priority: string;
  priorityRatio: number;
  relevance: string;
  source: string;
}

export interface SubjectSuggestions {
  name: string;
  priority: string;
  priorityRatio: number;
  recommendation: string;
}

export interface RadarData {
  subjectName: string;
  currentScore: number;
  targetScore: number;
}

export interface GeminiResults {
  skillsEvaluation: SkillEvaluation[];
  certificatesEvaluation: CertificateEvaluation[];
  subjectsEvaluation: SubjectEvaluation[];
  skillsSuggestions: SkillSuggestions[];
  certificatesSuggestions: CertificateSuggestions[];
  subjectsSuggestions: SubjectSuggestions[];
  radarData: RadarData[];
}

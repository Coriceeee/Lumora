import { ReactElement, JSXElementConstructor, ReactNodeArray, ReactPortal } from "react";

// FILE: src/types/CareerDashboard.ts
export interface Career {
  [x: string]: string | number | boolean | {} | ReactElement<any, string | JSXElementConstructor<any>> | ReactNodeArray | ReactPortal | null | undefined;
  name: string;
  matchPercentage: number;
  reason: string;
  preparationSteps: string[];
}

export interface SkillToImprove {
  name: string;
  priority: string;
  priorityRatio: number;
  reason: string;
}

export interface CertificateToAdd {
  [x: string]: any;
  name: string;
  priority: string;
  priorityRatio: number;
  relevance: string;
  source: string;
}

export interface SubjectToFocus {
  name: string;
  priority: string;
  priorityRatio: number;
  reason: string;
  recommendation: string;
}

export interface CareerDashboard {
  id?: string;
  userId: string;
  title: string;
  summary: string;
  createdAt: string;
  careers: Career[];
  skillsToImprove: SkillToImprove[];
  certificatesToAdd: CertificateToAdd[];
  subjectsToFocus: SubjectToFocus[];
}

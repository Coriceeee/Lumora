// FILE: src/types/CareerDashboard.ts
import {
  ReactElement,
  JSXElementConstructor,
  ReactNodeArray,
  ReactPortal,
} from "react";

// --------------------------- CAREER ----------------------------
export interface Career {
  [x: string]: string | number | string[] | undefined;
  name: string;
  fitScore?: number;     // AI / Dashboard dùng
  percent?: number;      // UI fallback
  reason?: string;
  preparationSteps?: string[];
}

// ----------------------- SKILL TO IMPROVE -----------------------
export interface SkillToImprove {
  name: string;
  priority: number | string;          // từ Gemini/Career Dashboard
  priorityRatio?: number | string;    // %
  reason?: string;
}

// ---------------------- CERTIFICATE TO ADD ----------------------
export interface CertificateToAdd {
  name: string;
  priority?: number | string;
  priorityRatio?: number | string;
  relevance?: number | string;        // % phù hợp
  source?: string;                    // nguồn đề xuất
  reason?: string;                    // (đã thêm để fix CertificatesCard)
}

// ------------------------ SUBJECT TO FOCUS ----------------------
export interface SubjectToFocus {
  name: string;
  score: number;                      // dùng cho Radar Subjects
  priority?: number | string;
  priorityRatio?: number | string;
  reason?: string;
  recommendation?: string;
}

// ------------------------ MAIN DASHBOARD ------------------------
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

  // ⭐ THÊM DÒNG NÀY ĐỂ FIX LỖI
  userSkills?: Record<string, number>;
}

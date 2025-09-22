// src/types/Skill.ts
export interface Skill {
  id?: string;          // Firestore doc id
  name: string;         // Tên kỹ năng: Ngoại ngữ, Giao tiếp, React...
  category?: string;    // (tuỳ chọn) nhóm kỹ năng
  description?: string; // (tuỳ chọn)
  createdAt?: number;
  updatedAt?: number;
}

// src/types/Skill.ts
export interface Skill {
  id?: string;          // Firestore doc id
  name: string;         // Tên kỹ năng: Ngoại ngữ, Giao tiếp, React...
  category?: string;    // (tuỳ chọn) nhóm kỹ năng (Ví dụ: kỹ năng mềm, kỹ năng chuyên môn)
  code?: string;  
  description?: string; // (tuỳ chọn) mô tả chi tiết về kỹ năng
  createdAt?: number;   // (tuỳ chọn) thời gian tạo
  updatedAt?: number;   // (tuỳ chọn) thời gian cập nhật
}

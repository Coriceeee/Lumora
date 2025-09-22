// src/types/UserSkill.ts
export type UserSkillLevel =
  | "Chưa có"
  | "Cơ bản"
  | "Trung bình"
  | "Thành thạo"
  | "Chuyên nghiệp";

export interface UserSkill {
  id?: string;           // Firestore doc id
  userId: string;        // id người dùng
  skillId: string;       // tham chiếu Skill.id
  date: string;          // yyyy-MM-dd
  level: UserSkillLevel; // đúng các option trong form
  description?: string;  // ghi chú
  createdAt?: number;
  updatedAt?: number;
}

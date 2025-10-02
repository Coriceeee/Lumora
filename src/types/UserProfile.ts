// src/types/UserProfile.ts

export interface UserProfile {
  careerId: string; // ID của nghề nghiệp
  careerName: string; // Tên của nghề nghiệp (nếu có)
  [key: string]: any; // Các thuộc tính khác nếu cần
}

// src/types/Subject.ts
import { ScoreType } from "./ScoreType"; // Import loại điểm

export interface Subject {
  id?: string;              // ID của môn học (Firestore doc id, tuỳ chọn)
  name: string;             // Tên môn học (Ví dụ: Toán, Lý, Hóa, Tiếng Anh)
  description?: string;     // Mô tả chi tiết về môn học
  scoreTypes?: ScoreType[]; // (tuỳ chọn) Mảng các loại điểm số liên quan đến môn học (Ví dụ: "Giữa kỳ", "Cuối kỳ")
}

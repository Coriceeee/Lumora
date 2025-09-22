// src/types/TargetProfile.ts
export interface TargetSkill {
  /** Tên kỹ năng/năng lực hiển thị trên radar (khớp với catalog hoặc tên bạn muốn map) */
  name: string;
  /** Mức mục tiêu (0–100) */
  score: number;
}

export interface TargetProfile {
  /** id document Firestore */
  id: string;
  /** userId sở hữu hồ sơ (hoặc “global” nếu dùng preset chia sẻ) */
  userId: string;
  /** Nhãn hiển thị ví dụ: "STEM Junior", "IELTS 6.5 Track" */
  label: string;
  /** Mảng kỹ năng mục tiêu */
  skills: TargetSkill[];
  /** Gợi ý mô tả ngắn */
  description?: string;
  /** Thời điểm cập nhật (ms) */
  updatedAt?: number;
  /** Có phải preset dùng chung (ai cũng thấy) */
  isGlobal?: boolean;
}

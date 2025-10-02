// src/types/ScoreType.ts
export interface ScoreType {
  id?: string;        // ID của loại điểm số (tuỳ chọn, có thể dùng để lưu trữ trong cơ sở dữ liệu Firestore)
  name: string;       // Tên của loại điểm số (Ví dụ: "Giữa kỳ", "Cuối kỳ")
  weight: number;     // Trọng số của loại điểm (Ví dụ: điểm giữa kỳ có trọng số 50%, điểm cuối kỳ có trọng số 50%)
  description: string; // Mô tả chi tiết về loại điểm (Ví dụ: "Điểm giữa kỳ được tính trong tháng 5")
}

export {}; // Đảm bảo module này được coi là module, không gây lỗi trong môi trường TypeScript

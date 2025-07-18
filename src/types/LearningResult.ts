export interface LearningResult {
  id?: string;           // ID duy nhất (Firestore tự tạo, optional khi tạo mới)
  userId: string;        // Mã người dùng (ẩn, lấy từ người đăng nhập)
  classLevel: number;    // Lớp học (10, 11, 12)
  subjectId: string;     // ID môn học (tham chiếu đến Subject)
  scoreTypeId: string;   // ID loại điểm (tham chiếu đến ScoreType)
  score: number;         // Điểm số
  date: string;          // Ngày kiểm tra (ISO date string, ví dụ: '2025-07-13')
  note?: string;         // Ghi chú (tuỳ chọn)
}

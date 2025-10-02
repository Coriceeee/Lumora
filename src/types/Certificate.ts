// src/types/Certificate.ts
export interface Certificate {
  id?: string;           // ID của chứng chỉ (Firestore doc id, tuỳ chọn)
  name: string;          // Tên chứng chỉ (Ví dụ: Chứng chỉ TOEIC, Chứng chỉ Google Analytics)
  provider?: string;     // Nhà cung cấp chứng chỉ (Ví dụ: Coursera, Udemy, Đại học ABC)
  description?: string;  // Mô tả chi tiết về chứng chỉ
  level?: string;        // Mức độ (Ví dụ: cơ bản, trung cấp, nâng cao)
  estHours?: number;     // Thời gian ước tính để hoàn thành chứng chỉ (ví dụ: 10 giờ học)
  url?: string;          // URL của chứng chỉ (nếu có)
  tags?: string[];       // Các thẻ liên quan đến chứng chỉ (Ví dụ: "Kỹ năng mềm", "Ngoại ngữ")
  createdAt?: number;    // (tuỳ chọn) thời gian tạo chứng chỉ
  updatedAt?: number;    // (tuỳ chọn) thời gian cập nhật chứng chỉ
  deleted?: boolean;     // (tuỳ chọn) trạng thái chứng chỉ đã bị xóa hay chưa
}

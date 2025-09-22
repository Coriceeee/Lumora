// src/types/UserCertificate.ts
export interface UserCertificate {
  id?: string;           // Firestore doc id
  userId: string;        // id người dùng
  certificateId: string; // tham chiếu Certificate.id
  date: string;          // yyyy-MM-dd (lấy từ <input type="date">)
  issuer: string;        // nơi cấp
  result: string;        // điểm/kết quả: 6.5, Pass, Merit...
  description?: string;  // ghi chú
  createdAt?: number;
  updatedAt?: number;
}

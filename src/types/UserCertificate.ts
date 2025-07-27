export interface UserCertificate {
  id?: string;
  certificateId: string; // id từ danh mục chứng chỉ
  userId: string;
  date: string;
  issuer: string;
  result: string;
  description: string;
}

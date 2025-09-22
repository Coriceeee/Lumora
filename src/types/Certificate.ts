export interface Certificate {
  id?: string;
  name: string;
  provider?: string;
  description?: string;
  level?: string;
  estHours?: number;
  url?: string;
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
  deleted?: boolean; // 👈 thêm field này
}

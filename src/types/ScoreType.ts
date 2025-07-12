export interface ScoreType {
  id?: string;
  code: string;
  name: string;
  weight: number;
  description: string;
  point?: number;  // thêm trường này (có thể optional nếu backend chưa bắt buộc)
}

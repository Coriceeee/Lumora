export interface LearningResult {
  id?: string;
  userId: string;            // userId bắt buộc
  classLevel: 10 | 11 | 12;
  semester: 1 | 2;
  subjectId: string;
  scoreTypeId: string;
  score: number;
  date: string;
  note?: string;
}

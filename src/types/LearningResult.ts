export interface LearningResult {
  [x: string]: any;
  id?: string;
  userId: string;
  classLevel: 10 | 11 | 12;
  semester: 1 | 2;
  subjectId: string;
  subjectName: string;
  scoreTypeId: string;
  score: number;
  termLabel: string;
  date: string;
  note?: string;
}

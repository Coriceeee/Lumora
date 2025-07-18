// types/Subject.ts
import { ScoreType } from "./ScoreType";

export interface Subject {
  id?: string;
  name: string;
  description?: string;
  scoreTypes?: ScoreType[]; // <-- thêm trường này
}

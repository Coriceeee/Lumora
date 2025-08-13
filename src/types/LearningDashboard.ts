import { Timestamp } from "firebase/firestore";

export interface LearningDashboard {
  selectedKeySubjects: never[];
  id: string;
  userId: string;
  createdAt: Timestamp;
  title: string;
  summary: string;

  importantSubjects: {
    subjects: {
      [subjectName: string]: {
        "Thường xuyên": number;
        "Giữa kỳ": number;
        "Cuối kỳ": number;
      };
    };
    overallStrengths: string;
    overallWeaknesses: string;
    learningAdvice: string;
  };

  subjectInsights: {
    subjectName: string;
    trend: string;
    strength: string;
    weakness: string;
    suggestion: string;
  }[];
}

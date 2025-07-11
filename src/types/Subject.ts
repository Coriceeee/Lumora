// src/types/Subject.ts
export interface Subject {
  id?: string; // Firestore document ID
  code: string;
  name: string;
  description: string;
}

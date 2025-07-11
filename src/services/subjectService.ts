// src/services/subjectService.ts
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Subject } from "../types/Subject";

const subjectsCollection = collection(db, "subjects");

export const addSubject = async (subject: Subject) => {
  return await addDoc(subjectsCollection, subject);
};

export const getAllSubjects = async (): Promise<Subject[]> => {
  const snapshot = await getDocs(subjectsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Subject));
};

export const updateSubject = async (id: string, subject: Subject) => {
   const subjectRef = doc(db, "subjects", id);

  // Loại bỏ id khỏi object
  const { id: _, ...subjectWithoutId } = subject;

  return await updateDoc(subjectRef, subjectWithoutId);
};

export const deleteSubject = async (id: string) => {
  const subjectRef = doc(db, "subjects", id);
  return await deleteDoc(subjectRef);
};

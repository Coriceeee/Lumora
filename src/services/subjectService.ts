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

// Khởi tạo collection reference
const subjectsCollection = collection(db, "subjects");

// Thêm môn học
export const addSubject = async (subject: Subject) => {
  try {
    const result = await addDoc(subjectsCollection, subject);
    return result;
  } catch (error) {
    console.error("❌ addSubject error:", error);
    throw error;
  }
};

// Lấy toàn bộ môn học
export const getAllSubjects = async (): Promise<Subject[]> => {
  try {
    const snapshot = await getDocs(subjectsCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Subject, "id">),
    }));
  } catch (error) {
    console.error("❌ getAllSubjects error:", error);
    return [];
  }
};

// Cập nhật môn học
export const updateSubject = async (id: string, subject: Subject) => {
  try {
    const subjectRef = doc(db, "subjects", id);
    const { id: _, ...dataWithoutId } = subject;
    return await updateDoc(subjectRef, dataWithoutId);
  } catch (error) {
    console.error("❌ updateSubject error:", error);
    throw error;
  }
};

// Xóa môn học
export const deleteSubject = async (id: string) => {
  try {
    const subjectRef = doc(db, "subjects", id);
    return await deleteDoc(subjectRef);
  } catch (error) {
    console.error("❌ deleteSubject error:", error);
    throw error;
  }
};

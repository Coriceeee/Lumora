import { db } from "../firebase/firebase"; // giống subjectService
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { ScoreType } from "../types/ScoreType";

const scoreTypesCollection = collection(db, "scoreTypes");

export const addScoreType = async (scoreType: ScoreType) => {
  return await addDoc(scoreTypesCollection, scoreType);
};

export const getAllScoreTypes = async (): Promise<ScoreType[]> => {
    // Tạo query với orderBy tăng dần
  const q = query(scoreTypesCollection, orderBy("weight", "asc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ScoreType));
};

export const updateScoreType = async (id: string, scoreType: ScoreType) => {
  const scoreTypeRef = doc(db, "scoreTypes", id);

  // Loại bỏ id khỏi object
  const { id: _, ...scoreTypeWithoutId } = scoreType;

  return await updateDoc(scoreTypeRef, scoreTypeWithoutId);
};

export const deleteScoreType = async (id: string) => {
  const scoreTypeRef = doc(db, "scoreTypes", id);
  return await deleteDoc(scoreTypeRef);
};

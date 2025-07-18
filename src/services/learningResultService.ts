import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { LearningResult } from "../types/LearningResult";

export async function addLearningResult(data: LearningResult) {
  const docRef = await addDoc(collection(db, "learningResults"), data);
  return docRef.id;
}

import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { LearningResult } from "../types/LearningResult";

const learningResultsCollection = collection(db, "learningResults");

export async function addLearningResult(data: LearningResult) {
  const docRef = await addDoc(learningResultsCollection, data);
  return docRef.id;
}
export const getAllLearningResults = async (): Promise<LearningResult[]> => {
  const snapshot = await getDocs(learningResultsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LearningResult));
};

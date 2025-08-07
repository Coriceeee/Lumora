import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { LearningResult } from "../types/LearningResult";

const learningResultsCollection = collection(db, "learningResults");

// Thêm kết quả học tập
export async function addLearningResult(data: LearningResult) {
  if (!data.userId) {
    console.error("❌ Lỗi: userId bị undefined:", data);
    throw new Error("userId is undefined. Cannot add learning result.");
  }

  const docRef = await addDoc(learningResultsCollection, {
    ...data,
    createdAt: new Date(),
  });

  return docRef.id;
}

// Lấy tất cả kết quả học tập
export const getAllLearningResults = async (): Promise<LearningResult[]> => {
  const snapshot = await getDocs(learningResultsCollection);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as LearningResult)
  );
};

// Lấy kết quả học tập theo userId
export const getLearningResultsByUser = async (
  userId: string
): Promise<LearningResult[]> => {
  const q = query(learningResultsCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as LearningResult)
  );
};

// Cập nhật kết quả học tập
export async function updateLearningResult(
  id: string,
  data: Partial<LearningResult>
) {
  if (!id) throw new Error("Missing id to updateLearningResult");
  const docRef = doc(db, "learningResults", id);
  await updateDoc(docRef, data);
}

// Xóa kết quả học tập
export async function deleteLearningResult(id: string) {
  if (!id) throw new Error("Missing id to deleteLearningResult");
  const docRef = doc(db, "learningResults", id);
  await deleteDoc(docRef);
}
  
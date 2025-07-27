import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { LearningDashboard } from "../types/LearningDashboard";

// 🔗 Reference đến collection Firestore
const dashboardRef = collection(db, "learningDashboards");

// 🧾 Lấy danh sách dashboard theo userId (timeline gần nhất trước)
export const getLearningDashboardsByUser = async (userId: string): Promise<LearningDashboard[]> => {
  const q = query(dashboardRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LearningDashboard[];
};

// ➕ Thêm mới dashboard
export const addLearningDashboard = async (dashboard: Omit<LearningDashboard, "id">) => {
  await addDoc(dashboardRef, {
    ...dashboard,
    createdAt: Timestamp.now(),
  });
};

// 🔄 Cập nhật dashboard
export const updateLearningDashboard = async (id: string, updatedData: Partial<LearningDashboard>) => {
  const dashboardDoc = doc(db, "LearningDashboards", id);
  await updateDoc(dashboardDoc, updatedData);
};

// ❌ Xóa dashboard
export const deleteLearningDashboard = async (id: string) => {
  const dashboardDoc = doc(db, "LearningDashboards", id);
  await deleteDoc(dashboardDoc);
};

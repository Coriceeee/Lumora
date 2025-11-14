// src/app/services/careerDashboardService.ts

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { CareerDashboard } from "../types/CareerDashboard";

const COLLECTION_NAME = "careerDashboards";

// 🔹 Thêm Career Dashboard
export const addCareerDashboard = async (dashboard: CareerDashboard) => {
  if (!dashboard.userId) {
    console.error("❌ Không thể thêm dashboard vì thiếu userId.");
    throw new Error("Thiếu userId khi thêm dashboard");
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...dashboard,
    createdAt: new Date().toISOString(),
  });

  return { ...dashboard, id: docRef.id };
};

// 🔹 Lấy danh sách dashboard theo user
export const getCareerDashboardsByUser = async (userId?: string) => {
  if (!userId) {
    console.warn("⚠️ getCareerDashboardsByUser bị gọi mà không có userId.");
    return [];
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (docSnap) =>
      ({
        id: docSnap.id,
        ...docSnap.data(),
      } as CareerDashboard)
  );
};

// 🔹 Xóa Career Dashboard
export const deleteCareerDashboard = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

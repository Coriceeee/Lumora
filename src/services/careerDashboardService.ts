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
import { getAuth } from "firebase/auth";

const COLLECTION_NAME = "careerDashboards";
 const userId = getAuth().currentUser?.uid || "";

// Thêm dashboard mới
export const addCareerDashboard = async (dashboard: CareerDashboard) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...dashboard,
 
  });
  return { ...dashboard, id: docRef.id, userId};
};

// Lấy tất cả dashboard của user giả
export const getCareerDashboardsByUser = async (userId?: string) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as CareerDashboard[];
};

// Xóa dashboard theo id
export const deleteCareerDashboard = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

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
const FAKE_USER_ID = "user_fake_id_123456"; // ID giả để test

// Thêm dashboard mới
export const addCareerDashboard = async (dashboard: CareerDashboard) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...dashboard,
    userId: FAKE_USER_ID, // luôn gắn ID giả
  });
  return { ...dashboard, id: docRef.id, userId: FAKE_USER_ID };
};

// Lấy tất cả dashboard của user giả
export const getCareerDashboardsByUser = async (userId?: string) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", FAKE_USER_ID)
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

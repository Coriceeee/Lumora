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

/* ================= CONSTANT ================= */
// 🔥 DÙNG DUY NHẤT 1 TÊN COLLECTION (tránh sai HOA–thường)
const COLLECTION_NAME = "learningDashboards";

/* ================= REFERENCE ================= */
const dashboardRef = collection(db, COLLECTION_NAME);

/* ================= GET ================= */
// 🧾 Lấy danh sách dashboard theo userId (timeline gần nhất trước)
export const getLearningDashboardsByUser = async (
  userId: string
): Promise<LearningDashboard[]> => {
  const q = query(
    dashboardRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<LearningDashboard, "id">),
  }));
};

/* ================= ADD ================= */
// ➕ Thêm mới dashboard
export const addLearningDashboard = async (
  dashboard: Omit<LearningDashboard, "id">
) => {
  await addDoc(dashboardRef, {
    ...dashboard,
    createdAt: Timestamp.now(),
  });
};

/* ================= UPDATE ================= */
// 🔄 Cập nhật dashboard (FIX LỖI KHÔNG LƯU)
export const updateLearningDashboard = async (
  id: string,
  updatedData: Partial<LearningDashboard>
) => {
  // ❗ FIX: dùng ĐÚNG collection name (learningDashboards)
  const dashboardDoc = doc(db, COLLECTION_NAME, id);

  await updateDoc(dashboardDoc, {
    ...updatedData,
    updatedAt: Timestamp.now(), // optional nhưng nên có
  });
};

/* ================= DELETE ================= */
// ❌ Xóa dashboard
export const deleteLearningDashboard = async (id: string) => {
  // ❗ FIX: dùng ĐÚNG collection name (learningDashboards)
  const dashboardDoc = doc(db, COLLECTION_NAME, id);

  await deleteDoc(dashboardDoc);
};

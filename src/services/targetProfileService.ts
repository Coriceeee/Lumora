import {
  collection, query, where, orderBy, limit, getDocs,
} from "firebase/firestore";
// Update the import path below to the correct location of your firebase config file
import { db } from "../firebase/firebase";
import type { CareerDashboard } from "../types/CareerDashboard";

const COLLECTION = "careerDashboards"; // Tên của collection chứa CareerDashboard

/** Lấy danh sách các career trong CareerDashboard mới nhất của user */
export async function getCareersInLatestDashboard(userId: string): Promise<string[]> {
  const colRef = collection(db, COLLECTION);

  // Truy vấn để lấy CareerDashboard mới nhất của user
  const q = query(
    colRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snap = await getDocs(q);
  const result: string[] = [];

  // Nếu tìm thấy CareerDashboard của user
  if (!snap.empty) {
    const doc = snap.docs[0];
    const data = doc.data() as CareerDashboard;

    // Lấy danh sách career từ CareerDashboard
    if (data.careers && Array.isArray(data.careers)) {
      data.careers.forEach(career => {
        result.push(career.name);  // Lấy tên career (có thể thay đổi nếu muốn lấy thêm thông tin)
      });
    }
  }

  return result;
}

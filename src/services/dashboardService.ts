import { db } from "../firebase/firebase"; // Đảm bảo bạn đã có cấu hình firebase
import { collection, getDocs } from "firebase/firestore";
import { Dashboard } from "../types/Dashboard";

const dashboardCollection = collection(db, "dashboards");

export async function getAllDashboards(): Promise<Dashboard[]> {
  const snapshot = await getDocs(dashboardCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Dashboard[];
}

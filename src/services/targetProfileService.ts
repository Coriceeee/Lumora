// src/services/targetProfileService.ts
import {
  collection, query, where, orderBy, limit, getDocs,
} from "firebase/firestore";
// Update the import path below to the correct location of your firebase config file
import { db } from "../firebase/firebase";
import type { TargetProfile } from "../types/TargetProfile";

const COLLECTION = "target_profiles";

/** Lấy danh sách hồ sơ mục tiêu của user + (tùy chọn) preset global */
export async function getTargetProfilesByUser(
  userId: string,
  includeGlobal = true
): Promise<TargetProfile[]> {
  const colRef = collection(db, COLLECTION);

  const qUser = query(
    colRef,
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
  );
  const result: TargetProfile[] = [];
  const snapUser = await getDocs(qUser);
  snapUser.forEach((doc) => {
    const data = doc.data() as Omit<TargetProfile, "id">;
    result.push({ id: doc.id, ...data });
  });

  if (includeGlobal) {
    const qGlobal = query(
      colRef,
      where("isGlobal", "==", true),
      orderBy("updatedAt", "desc"),
    );
    const snapGlobal = await getDocs(qGlobal);
    snapGlobal.forEach((doc) => {
      // tránh trùng
      if (!result.find((r) => r.id === doc.id)) {
        const data = doc.data() as Omit<TargetProfile, "id">;
        result.push({ id: doc.id, ...data });
      }
    });
  }

  return result;
}

/** Lấy 1 hồ sơ mặc định: ưu tiên của user, nếu không có thì global (mới nhất) */
export async function getDefaultTargetProfile(
  userId: string
): Promise<TargetProfile | null> {
  const colRef = collection(db, COLLECTION);

  const qUser = query(
    colRef,
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
    limit(1),
  );
  const snapUser = await getDocs(qUser);
  if (!snapUser.empty) {
    const doc = snapUser.docs[0];
    const data = doc.data() as Omit<TargetProfile, "id">;
    return { id: doc.id, ...data };
  }

  const qGlobal = query(
    colRef,
    where("isGlobal", "==", true),
    orderBy("updatedAt", "desc"),
    limit(1),
  );
  const snapGlobal = await getDocs(qGlobal);
  if (!snapGlobal.empty) {
    const doc = snapGlobal.docs[0];
    const data = doc.data() as Omit<TargetProfile, "id">;
    return { id: doc.id, ...data };
  }

  return null;
}

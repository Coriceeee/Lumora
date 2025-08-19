// src/services/healingTreeService.ts
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const getHealingTree = async (userId: string) => {
  const ref = doc(db, "healingTree", userId);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  // nếu chưa có thì khởi tạo
  const init = { growthLevel: 1, auraEnergy: 20, lastWateredAt: new Date() };
  await setDoc(ref, init);
  return init;
};

export const updateHealingTree = async (userId: string, data: any) => {
  const ref = doc(db, "healingTree", userId);
  await setDoc(ref, data, { merge: true });
};

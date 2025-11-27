import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { UserSkill } from "../types/UserSkill";

export const addUserSkill = async (record: UserSkill) => {
  await addDoc(collection(db, "userSkills"), record);
};

export const getUserSkills = async (userId: string) => {
  const q = query(collection(db, "userSkills"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserSkill[];
};
export const getSkillDefinitions = async () => {
  const snap = await getDocs(collection(db, "skills"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

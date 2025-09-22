// src/services/skillService.ts
import {
  collection, getDocs, query, orderBy, addDoc, doc, updateDoc, deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Skill } from "../types/Skill";

const COL = "skills";

export async function getAllSkills(): Promise<Skill[]> {
  const q = query(collection(db, COL), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Skill, "id">) }));
}

export async function addSkill(payload: Skill): Promise<string> {
  const { createdAt, updatedAt, ...rest } = payload;
  const ref = await addDoc(collection(db, COL), {
    ...rest,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateSkill(id: string, patch: Partial<Skill>) {
  await updateDoc(doc(db, COL, id), {
    ...patch,
    updatedAt: Date.now(),
  });
}

// ✅ BỔ SUNG HÀM NÀY
export async function deleteSkill(id: string) {
  await deleteDoc(doc(db, COL, id));
}

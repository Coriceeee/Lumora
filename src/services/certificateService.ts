// src/services/certificateService.ts
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Certificate } from "../types/Certificate";

const COL = "certificates";

export async function getAllCertificates(): Promise<Certificate[]> {
  const q = query(collection(db, COL), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Certificate, "id">),
  }));
}

export async function addCertificate(payload: Certificate): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...payload,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateCertificate(
  id: string,
  patch: Partial<Certificate>
) {
  await updateDoc(doc(db, COL, id), {
    ...patch,
    updatedAt: Date.now(),
  });
}

// ✅ Xóa hẳn document khỏi Firestore
export async function deleteCertificate(id: string) {
  await deleteDoc(doc(db, COL, id));
}

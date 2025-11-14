// Firestore v9 modular

import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

/* ------------------------------------------- */
/*  USER SKILLS                                */
/* ------------------------------------------- */

export const addUserSkill = async (userId: string, skill: any) => {
  const ref = collection(db, "users", userId, "skills");
  return await addDoc(ref, {
    ...skill,
    updatedAt: serverTimestamp(),
    source: skill.source ?? "manual",
  });
};

export const updateUserSkillStatus = async (
  userId: string,
  skillId: string,
  status: string
) => {
  const ref = doc(db, "users", userId, "skills", skillId);
  return await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const getUserSkillsFirestore = async (userId: string) => {
  const ref = collection(db, "users", userId, "skills");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/* ------------------------------------------- */
/*  USER CERTIFICATES                          */
/* ------------------------------------------- */

export const addUserCertificate = async (userId: string, cert: any) => {
  const ref = collection(db, "users", userId, "certificates");
  return await addDoc(ref, {
    ...cert,
    updatedAt: serverTimestamp(),
  });
};

export const updateUserCertificateStatus = async (
  userId: string,
  certId: string,
  status: string
) => {
  const ref = doc(db, "users", userId, "certificates", certId);
  return await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const getUserCertificatesFirestore = async (userId: string) => {
  const ref = collection(db, "users", userId, "certificates");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

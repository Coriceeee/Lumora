// Firestore v9 modular
import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

/* ------------------------------------------- */
/*  USER SKILLS                                */
/* ------------------------------------------- */

// ➤ Thêm kỹ năng cho user
export const addUserSkill = async (userId: string, skill: any) => {
  const ref = collection(db, "users", userId, "skills");
  return await addDoc(ref, {
    ...skill,
    updatedAt: serverTimestamp(),
    source: skill.source ?? "manual", // auto gắn nếu không có
  });
};

// ➤ Lấy danh sách kỹ năng theo user
export const getUserSkills = async (userId: string) => {
  const ref = collection(db, "users", userId, "skills");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// (Giữ lại bản cũ theo yêu cầu)
export const getUserSkillsFirestore = async (userId: string) => {
  const ref = collection(db, "users", userId, "skills");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ➤ Cập nhật trạng thái kỹ năng (nâng cấp, hoàn thành, vv.)
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

// ➤ Xóa kỹ năng khỏi user
export const deleteUserSkill = async (userId: string, skillId: string) => {
  const ref = doc(db, "users", userId, "skills", skillId);
  await deleteDoc(ref);
};


/* ------------------------------------------- */
/*  USER CERTIFICATES                          */
/* ------------------------------------------- */

// ➤ Thêm chứng chỉ cho user
export const addUserCertificate = async (userId: string, cert: any) => {
  const ref = collection(db, "users", userId, "certificates");
  return await addDoc(ref, {
    ...cert,
    updatedAt: serverTimestamp(),
  });
};

// ➤ Lấy chứng chỉ theo user
export const getUserCertificatesFirestore = async (userId: string) => {
  const ref = collection(db, "users", userId, "certificates");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ➤ Cập nhật trạng thái chứng chỉ
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

// ➤ Xóa chứng chỉ
export const deleteUserCertificate = async (userId: string, certId: string) => {
  const ref = doc(db, "users", userId, "certificates", certId);
  await deleteDoc(ref);
};

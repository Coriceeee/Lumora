import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { UserCertificate } from "../types/UserCertificate";

export const addUserCertificate = async (record: UserCertificate) => {
  await addDoc(collection(db, "userCertificates"), record);
};

export const getUserCertificates = async (userId: string) => {
  const q = query(collection(db, "userCertificates"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserCertificate[];
};

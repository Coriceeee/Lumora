import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Certificate } from "../types/Certificate";

const collectionName = "certificates";

export const getAllCertificates = async (): Promise<Certificate[]> => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Certificate, "id">),
  }));
};

export const addCertificate = async (certificate: Certificate) => {
  await addDoc(collection(db, collectionName), certificate);
};

export const deleteCertificate = async (id: string) => {
  await deleteDoc(doc(db, collectionName, id));
};

import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Survey } from "../types/Survey";

const surveyCollection = collection(db, "surveys");

export const getAllSurveys = async (): Promise<Survey[]> => {
  const snapshot = await getDocs(surveyCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Survey[];
};

export const addSurvey = async (survey: Survey) => {
  await addDoc(surveyCollection, survey);
};

export const deleteSurvey = async (id: string) => {
  await deleteDoc(doc(db, "surveys", id));
};

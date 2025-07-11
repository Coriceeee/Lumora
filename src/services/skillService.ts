import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Skill } from "../types/Skill";

const skillsCollection = collection(db, "skills");

export const addSkill = async (skill: Skill) => {
  return await addDoc(skillsCollection, skill);
};

export const getAllSkills = async (): Promise<Skill[]> => {
  const snapshot = await getDocs(skillsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Skill));
};

export const updateSkill = async (id: string, skill: Skill) => {
  const skillRef = doc(db, "skills", id);
  const { id: _, ...skillWithoutId } = skill;
  return await updateDoc(skillRef, skillWithoutId);
};

export const deleteSkill = async (id: string) => {
  const skillRef = doc(db, "skills", id);
  return await deleteDoc(skillRef);
};

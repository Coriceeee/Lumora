import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface CareerRequirement {
  name: string;
  subjects: Record<string, number>;
  skills: Record<string, number>;
  aliases?: string[];
  isActive?: boolean;
  updatedAt?: any;
}

const COLLECTION_NAME = "careerRequirements";

const slugify = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const getCareerRequirementsFromFirestore = async (): Promise<
  Record<string, CareerRequirement>
> => {
  const snap = await getDocs(collection(db, COLLECTION_NAME));

  const result: Record<string, CareerRequirement> = {};

  snap.forEach((docSnap) => {
    const data = docSnap.data() as CareerRequirement;

    if (data?.isActive === false) return;
    if (!data?.name) return;

    result[data.name] = {
      name: data.name,
      aliases: data.aliases || [],
      subjects: data.subjects || {},
      skills: data.skills || {},
      isActive: data.isActive ?? true,
      updatedAt: data.updatedAt,
    };
  });

  return result;
};

export const saveCareerRequirement = async (
  requirement: CareerRequirement
): Promise<void> => {
  const id = slugify(requirement.name);

  await setDoc(
    doc(db, COLLECTION_NAME, id),
    {
      ...requirement,
      isActive: requirement.isActive ?? true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const deleteCareerRequirement = async (
  careerName: string
): Promise<void> => {
  const id = slugify(careerName);
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
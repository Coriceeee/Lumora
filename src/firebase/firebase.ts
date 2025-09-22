import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUsBh_d1cwauzYvFFFdkShyHKAF0jUx4Y",
  authDomain: "lumora-34c02.firebaseapp.com",
  projectId: "lumora-34c02",
  storageBucket: "lumora-34c02.firebasestorage.app",
  messagingSenderId: "61501812101",
  appId: "1:61501812101:web:491d5e5937653b8c0ee8ec",
  measurementId: "G-CZE6MTSGDM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const authFb = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

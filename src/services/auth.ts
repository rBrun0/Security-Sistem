import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const login = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const register = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export async function getUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

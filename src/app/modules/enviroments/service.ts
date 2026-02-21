import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { Environment } from "./types";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";

const collectionRef = collection(db, "environments");

export async function createEnvironment(
  data: Omit<Environment, "id" | "created_at">,
) {
  return await addDoc(
    collectionRef,
    removeUndefinedFields({
      ...data,
      created_at: new Date(),
    }),
  );
}

export async function getActiveEnvironments() {
  const q = query(collectionRef, where("status", "==", "active"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Environment[];
}

export async function updateEnvironment(
  id: string,
  data: Partial<Environment>,
) {
  const ref = doc(db, "environments", id);
  return await updateDoc(
    ref,
    removeUndefinedFields({
      ...data,
      updated_at: new Date(),
    }),
  );
}

export const deleteEnvironment = async (id: string) => {
  await deleteDoc(doc(db, "environments", id));
};

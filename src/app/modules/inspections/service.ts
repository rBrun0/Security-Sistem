import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Inspection } from "./types";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";

const collectionRef = collection(db, "inspections");

export async function createInspection(
  data: Omit<Inspection, "id" | "created_at">,
) {
  return await addDoc(
    collectionRef,
    removeUndefinedFields({
      ...data,
      created_at: new Date(),
    }),
  );
}

export async function getInspections() {
  const snapshot = await getDocs(collectionRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Inspection[];
}

export async function updateInspection(id: string, data: Partial<Inspection>) {
  const ref = doc(db, "inspections", id);
  return await updateDoc(
    ref,
    removeUndefinedFields({
      ...data,
      updated_at: new Date(),
    }),
  );
}

export async function deleteInspection(id: string) {
  const ref = doc(db, "inspections", id);
  return await deleteDoc(ref);
}

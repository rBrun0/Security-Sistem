import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Company } from "./types";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";

const collectionRef = collection(db, "companies");

export async function createCompany(data: Omit<Company, "id" | "created_at">) {
  return await addDoc(
    collectionRef,
    removeUndefinedFields({
      ...data,
      created_at: new Date(),
    }),
  );
}

export async function getActiveCompanies() {
  const q = query(collectionRef, where("status", "==", "active"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Company[];
}

export async function updateCompany(id: string, data: Partial<Company>) {
  const ref = doc(db, "companies", id);
  return await updateDoc(
    ref,
    removeUndefinedFields({
      ...data,
      updated_at: new Date(),
    }),
  );
}

export async function softDeleteCompany(id: string) {
  return updateCompany(id, { status: "deleted" });
}

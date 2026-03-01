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
import {
  normalizeOptionalPhoneValue,
  removeUndefinedFields,
} from "@/lib/utils";

const collectionRef = collection(db, "environments");

export async function createEnvironment(
  data: Omit<Environment, "id" | "created_at">,
) {
  const rawPhone = (data as Record<string, unknown>).phone as
    | string
    | undefined;
  const rawPhoneNumber = (data as Record<string, unknown>).phoneNumber as
    | string
    | undefined;
  const normalizedPhone = normalizeOptionalPhoneValue(
    rawPhoneNumber ?? rawPhone,
  );

  return await addDoc(
    collectionRef,
    removeUndefinedFields({
      ...data,
      phoneNumber: normalizedPhone,
      phone: normalizedPhone,
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
  const rawPhone = (data as Record<string, unknown>).phone as
    | string
    | undefined;
  const rawPhoneNumber = (data as Record<string, unknown>).phoneNumber as
    | string
    | undefined;
  const normalizedPhone = normalizeOptionalPhoneValue(
    rawPhoneNumber ?? rawPhone,
  );

  const ref = doc(db, "environments", id);
  return await updateDoc(
    ref,
    removeUndefinedFields({
      ...data,
      phoneNumber: normalizedPhone,
      phone: normalizedPhone,
      updated_at: new Date(),
    }),
  );
}

export const deleteEnvironment = async (id: string) => {
  await deleteDoc(doc(db, "environments", id));
};

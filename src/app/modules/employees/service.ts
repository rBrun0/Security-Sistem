import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";

import { Employee } from "./types";
import { removeUndefinedFields } from "@/lib/utils";

const employeeCollection = collection(db, "employees");

export async function getEmployees(): Promise<Employee[]> {
  const snapshot = await getDocs(employeeCollection);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Employee[];
}

export async function getActiveEmployees(): Promise<Employee[]> {
  const q = query(employeeCollection, where("status", "==", "active"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Employee[];
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const docRef = doc(db, "employees", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Employee;
}

export async function createEmployee(data: Omit<Employee, "id">) {
  const now = Timestamp.now();

  return await addDoc(
    employeeCollection,
    removeUndefinedFields({
      ...data,
      created_at: now,
      updated_at: now,
    }),
  );
}

export async function updateEmployee(id: string, data: Partial<Employee>) {
  const docRef = doc(db, "employees", id);

  return await updateDoc(
    docRef,
    removeUndefinedFields({
      ...data,
      updated_at: Timestamp.now(),
    }),
  );
}

export async function deleteEmployee(id: string) {
  const docRef = doc(db, "employees", id);
  return await deleteDoc(docRef);
}

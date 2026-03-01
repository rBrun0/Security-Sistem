import {
  collection,
  doc,
  getDocs,
  getDoc,
  runTransaction,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";

import { Employee } from "./types";
import {
  normalizeOptionalPhoneValue,
  removeUndefinedFields,
} from "@/lib/utils";
import {
  normalizeUniqueDocument,
  releaseUniqueDocument,
  reserveUniqueDocument,
} from "../shared/document-uniqueness";

const employeeCollection = collection(db, "employees");

export type CreateEmployeeInput = {
  name: string;
  cpf: string;
  status: Employee["status"];
  rg?: string;
  job_title?: string;
  role?: string;
  company?: string;
  environment_id?: string;
  phone?: string;
  email?: string;
  admission_date?: string;
};

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

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

export async function createEmployee(data: CreateEmployeeInput) {
  const now = Timestamp.now();
  const normalizedPhone = normalizeOptionalPhoneValue(data.phone);
  const normalizedCpf = normalizeUniqueDocument("cpf", data.cpf);
  const normalizedRg = normalizeUniqueDocument("rg", data.rg);

  const newEmployeeRef = doc(employeeCollection);

  await runTransaction(db, async (transaction) => {
    await reserveUniqueDocument({
      transaction,
      db,
      type: "cpf",
      value: normalizedCpf,
      ownerCollection: "employees",
      ownerId: newEmployeeRef.id,
      duplicateMessage: "Já existe um colaborador com este CPF.",
    });

    await reserveUniqueDocument({
      transaction,
      db,
      type: "rg",
      value: normalizedRg,
      ownerCollection: "employees",
      ownerId: newEmployeeRef.id,
      duplicateMessage: "Já existe um colaborador com este RG.",
    });

    transaction.set(
      newEmployeeRef,
      removeUndefinedFields({
        ...data,
        cpf: normalizedCpf,
        rg: normalizedRg || undefined,
        phone: normalizedPhone,
        admission_date: data.admission_date ?? "",
        created_at: now,
        updated_at: now,
      }),
    );
  });

  return newEmployeeRef;
}

export async function updateEmployee(id: string, data: UpdateEmployeeInput) {
  const docRef = doc(db, "employees", id);
  const normalizedPhone = normalizeOptionalPhoneValue(data.phone);
  const providedCpf =
    data.cpf !== undefined
      ? normalizeUniqueDocument("cpf", data.cpf)
      : undefined;
  const providedRg =
    data.rg !== undefined ? normalizeUniqueDocument("rg", data.rg) : undefined;

  await runTransaction(db, async (transaction) => {
    const currentSnapshot = await transaction.get(docRef);

    if (!currentSnapshot.exists()) {
      throw new Error("Colaborador não encontrado.");
    }

    const currentData = currentSnapshot.data() as Record<string, unknown>;
    const currentCpf = normalizeUniqueDocument(
      "cpf",
      String(currentData.cpf ?? ""),
    );
    const currentRg = normalizeUniqueDocument(
      "rg",
      String(currentData.rg ?? ""),
    );

    const nextCpf =
      providedCpf && providedCpf.length > 0 ? providedCpf : currentCpf;
    const nextRg = providedRg && providedRg.length > 0 ? providedRg : currentRg;

    await reserveUniqueDocument({
      transaction,
      db,
      type: "cpf",
      value: nextCpf,
      ownerCollection: "employees",
      ownerId: id,
      duplicateMessage: "Já existe um colaborador com este CPF.",
    });

    await reserveUniqueDocument({
      transaction,
      db,
      type: "rg",
      value: nextRg,
      ownerCollection: "employees",
      ownerId: id,
      duplicateMessage: "Já existe um colaborador com este RG.",
    });

    if (currentCpf && currentCpf !== nextCpf) {
      await releaseUniqueDocument({
        transaction,
        db,
        type: "cpf",
        value: currentCpf,
        ownerCollection: "employees",
        ownerId: id,
      });
    }

    if (currentRg && currentRg !== nextRg) {
      await releaseUniqueDocument({
        transaction,
        db,
        type: "rg",
        value: currentRg,
        ownerCollection: "employees",
        ownerId: id,
      });
    }

    transaction.update(
      docRef,
      removeUndefinedFields({
        ...data,
        cpf: providedCpf,
        rg: providedRg || undefined,
        phone: normalizedPhone,
        updated_at: Timestamp.now(),
      }),
    );
  });
}

export async function deleteEmployee(id: string) {
  const docRef = doc(db, "employees", id);
  return await runTransaction(db, async (transaction) => {
    const currentSnapshot = await transaction.get(docRef);
    if (!currentSnapshot.exists()) return;

    const currentData = currentSnapshot.data() as Record<string, unknown>;
    const currentCpf = normalizeUniqueDocument(
      "cpf",
      String(currentData.cpf ?? ""),
    );
    const currentRg = normalizeUniqueDocument(
      "rg",
      String(currentData.rg ?? ""),
    );

    await releaseUniqueDocument({
      transaction,
      db,
      type: "cpf",
      value: currentCpf,
      ownerCollection: "employees",
      ownerId: id,
    });

    await releaseUniqueDocument({
      transaction,
      db,
      type: "rg",
      value: currentRg,
      ownerCollection: "employees",
      ownerId: id,
    });

    transaction.delete(docRef);
  });
}

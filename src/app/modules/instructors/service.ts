import {
  collection,
  doc,
  getDocs,
  getDoc,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";

import { Instructor } from "./types";
import {
  normalizeOptionalPhoneValue,
  removeUndefinedFields,
} from "@/lib/utils";
import {
  normalizeUniqueDocument,
  releaseUniqueDocument,
  reserveUniqueDocument,
} from "../shared/document-uniqueness";

const instructorsCollection = collection(db, "instructors");

type FirestoreDocData = {
  id?: string;
  data?: () => Record<string, unknown>;
  [key: string]: unknown;
};

type RegistrationData = {
  tipo?: string;
  type?: string;
  numero?: string;
  number?: string;
  mte?: string;
};

function normalizeDocData(d: FirestoreDocData): Instructor {
  const data = (d.data ? d.data() : d) as Record<string, unknown>;
  const registrationsData = Array.isArray(data.registros_profissionais)
    ? (data.registros_profissionais as RegistrationData[])
    : undefined;

  return {
    id: d.id,
    name: (data.nome ?? data.name) as string | undefined,
    cpf: data.cpf as string | undefined,
    phoneNumber: (data.telefone ?? data.phone ?? data.phoneNumber) as
      | string
      | undefined,
    email: data.email as string | undefined,
    qualifications: (data.qualificacoes ?? data.qualifications) as
      | string
      | undefined,
    professionalRegistrations:
      registrationsData?.map((registration) => ({
        type: registration.tipo ?? registration.type,
        number: registration.numero ?? registration.number,
        mte: registration.mte,
      })) ??
      (data.professionalRegistrations as
        | Instructor["professionalRegistrations"]
        | undefined),
  } as Instructor;
}

export async function getInstructors(): Promise<Instructor[]> {
  const snapshot = await getDocs(instructorsCollection);
  return snapshot.docs.map((d) =>
    normalizeDocData({ id: d.id, ...d.data(), data: () => d.data() }),
  );
}

export async function getInstructorById(
  id: string,
): Promise<Instructor | null> {
  const docRef = doc(db, "instructors", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return normalizeDocData({
    id: snapshot.id,
    ...snapshot.data(),
    data: () => snapshot.data(),
  });
}

export async function createInstructor(data: Omit<Instructor, "id">) {
  const now = Timestamp.now();
  const normalizedPhone = normalizeOptionalPhoneValue(data.phoneNumber);
  const normalizedCpf = normalizeUniqueDocument("cpf", data.cpf);
  const newInstructorRef = doc(instructorsCollection);

  await runTransaction(db, async (transaction) => {
    await reserveUniqueDocument({
      transaction,
      db,
      type: "cpf",
      value: normalizedCpf,
      ownerCollection: "instructors",
      ownerId: newInstructorRef.id,
      duplicateMessage: "Já existe um instrutor cadastrado com este CPF.",
    });

    transaction.set(
      newInstructorRef,
      removeUndefinedFields({
        ...data,
        cpf: normalizedCpf || undefined,
        phoneNumber: normalizedPhone,
        phone: normalizedPhone,
        created_at: now,
        updated_at: now,
      }),
    );
  });

  return newInstructorRef;
}

export async function updateInstructor(id: string, data: Partial<Instructor>) {
  const docRef = doc(db, "instructors", id);
  const normalizedPhone = normalizeOptionalPhoneValue(data.phoneNumber);
  const providedCpf =
    data.cpf !== undefined
      ? normalizeUniqueDocument("cpf", data.cpf)
      : undefined;

  return await runTransaction(db, async (transaction) => {
    const currentSnapshot = await transaction.get(docRef);

    if (!currentSnapshot.exists()) {
      throw new Error("Instrutor não encontrado.");
    }

    const currentData = currentSnapshot.data() as Record<string, unknown>;
    const currentCpf = normalizeUniqueDocument(
      "cpf",
      String(currentData.cpf ?? ""),
    );
    const nextCpf =
      providedCpf && providedCpf.length > 0 ? providedCpf : currentCpf;

    await reserveUniqueDocument({
      transaction,
      db,
      type: "cpf",
      value: nextCpf,
      ownerCollection: "instructors",
      ownerId: id,
      duplicateMessage: "Já existe um instrutor cadastrado com este CPF.",
    });

    if (currentCpf && currentCpf !== nextCpf) {
      await releaseUniqueDocument({
        transaction,
        db,
        type: "cpf",
        value: currentCpf,
        ownerCollection: "instructors",
        ownerId: id,
      });
    }

    transaction.update(
      docRef,
      removeUndefinedFields({
        ...data,
        cpf: providedCpf || undefined,
        phoneNumber: normalizedPhone,
        phone: normalizedPhone,
        updated_at: Timestamp.now(),
      }),
    );
  });
}

export const deleteInstructor = async (id: string) => {
  const docRef = doc(db, "instructors", id);

  await runTransaction(db, async (transaction) => {
    const currentSnapshot = await transaction.get(docRef);
    if (!currentSnapshot.exists()) return;

    const currentData = currentSnapshot.data() as Record<string, unknown>;
    const currentCpf = normalizeUniqueDocument(
      "cpf",
      String(currentData.cpf ?? ""),
    );

    await releaseUniqueDocument({
      transaction,
      db,
      type: "cpf",
      value: currentCpf,
      ownerCollection: "instructors",
      ownerId: id,
    });

    transaction.delete(docRef);
  });
};

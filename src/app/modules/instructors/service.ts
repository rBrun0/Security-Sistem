import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";

import { Instructor } from "./types";
import { removeUndefinedFields } from "@/lib/utils";

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

  return normalizeDocData(snapshot as unknown as FirestoreDocData);
}

export async function createInstructor(data: Omit<Instructor, "id">) {
  const now = Timestamp.now();

  return await addDoc(
    instructorsCollection,
    removeUndefinedFields({
      ...data,
      created_at: now,
      updated_at: now,
    }),
  );
}

export async function updateInstructor(id: string, data: Partial<Instructor>) {
  const docRef = doc(db, "instructors", id);

  return await updateDoc(
    docRef,
    removeUndefinedFields({
      ...data,
      updated_at: Timestamp.now(),
    }),
  );
}

export const deleteInstructor = async (id: string) => {
  await deleteDoc(doc(db, "instructors", id));
};

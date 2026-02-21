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

function normalizeDocData(d): Instructor {
  const data = d.data ? d.data() : d;

  return {
    id: d.id,
    name: data.nome ?? data.name,
    cpf: data.cpf,
    phoneNumber: data.phoneNumber,
    email: data.email,
    qualifications: data.qualificacoes ?? data.qualifications,
    professionalRegistrations:
      data.registros_profissionais?.map((r) => ({
        type: r.tipo ?? r.type,
        number: r.numero ?? r.number,
      })) ?? data.professionalRegistrations,
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

  return normalizeDocData(snapshot);
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

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
import { Instructor as InstructorType } from "../instructors/types";
import { removeUndefinedFields } from "@/lib/utils";

const technicalResponsiblesCollection = collection(
  db,
  "technical_responsibles",
);

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

function normalizeDocData(d: FirestoreDocData): InstructorType {
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
        | InstructorType["professionalRegistrations"]
        | undefined),
  } as InstructorType;
}

export async function getTechnicalResponsibles(): Promise<InstructorType[]> {
  const snapshot = await getDocs(technicalResponsiblesCollection);
  return snapshot.docs.map((d) =>
    normalizeDocData({ id: d.id, ...d.data(), data: () => d.data() }),
  );
}

export async function getTechnicalResponsibleById(
  id: string,
): Promise<InstructorType | null> {
  const docRef = doc(db, "technical_responsibles", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return normalizeDocData(snapshot as unknown as FirestoreDocData);
}

export async function createTechnicalResponsible(
  data: Omit<InstructorType, "id">,
) {
  const now = Timestamp.now();

  return await addDoc(
    technicalResponsiblesCollection,
    removeUndefinedFields({
      ...data,
      created_at: now,
      updated_at: now,
    }),
  );
}

export async function updateTechnicalResponsible(
  id: string,
  data: Partial<InstructorType>,
) {
  const docRef = doc(db, "technical_responsibles", id);

  return await updateDoc(
    docRef,
    removeUndefinedFields({
      ...data,
      updated_at: Timestamp.now(),
    }),
  );
}

export const deleteTechnicalResponsible = async (id: string) => {
  await deleteDoc(doc(db, "technical_responsibles", id));
};

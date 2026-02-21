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

function normalizeDocData(d: any): InstructorType {
  const data = d.data ? d.data() : d;

  return {
    id: d.id,
    name: data.nome ?? data.name,
    cpf: data.cpf,
    phoneNumber: data.telefone ?? data.phone ?? data.phoneNumber,
    email: data.email,
    qualifications: data.qualificacoes ?? data.qualifications,
    professionalRegistrations:
      data.registros_profissionais?.map((r: any) => ({
        type: r.tipo ?? r.type,
        number: r.numero ?? r.number,
        mte: r.mte,
      })) ?? data.professionalRegistrations,
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
  return normalizeDocData(snapshot as any);
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

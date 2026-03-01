import {
  collection,
  doc,
  getDocs,
  getDoc,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Instructor as InstructorType } from "../instructors/types";
import {
  normalizeOptionalPhoneValue,
  removeUndefinedFields,
} from "@/lib/utils";
import {
  normalizeUniqueDocument,
  releaseUniqueDocument,
  reserveUniqueDocument,
} from "../shared/document-uniqueness";

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
  return normalizeDocData({
    id: snapshot.id,
    ...snapshot.data(),
    data: () => snapshot.data(),
  });
}

export async function createTechnicalResponsible(
  data: Omit<InstructorType, "id">,
) {
  const now = Timestamp.now();
  const normalizedPhone = normalizeOptionalPhoneValue(data.phoneNumber);
  const normalizedCpf = normalizeUniqueDocument("cpf", data.cpf);
  const newTechnicalResponsibleRef = doc(technicalResponsiblesCollection);

  await runTransaction(db, async (transaction) => {
    await reserveUniqueDocument({
      transaction,
      db,
      type: "cpf",
      value: normalizedCpf,
      ownerCollection: "technical_responsibles",
      ownerId: newTechnicalResponsibleRef.id,
      duplicateMessage:
        "Já existe um responsável técnico cadastrado com este CPF.",
    });

    transaction.set(
      newTechnicalResponsibleRef,
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

  return newTechnicalResponsibleRef;
}

export async function updateTechnicalResponsible(
  id: string,
  data: Partial<InstructorType>,
) {
  const docRef = doc(db, "technical_responsibles", id);
  const normalizedPhone = normalizeOptionalPhoneValue(data.phoneNumber);
  const providedCpf =
    data.cpf !== undefined
      ? normalizeUniqueDocument("cpf", data.cpf)
      : undefined;

  return await runTransaction(db, async (transaction) => {
    const currentSnapshot = await transaction.get(docRef);

    if (!currentSnapshot.exists()) {
      throw new Error("Responsável técnico não encontrado.");
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
      ownerCollection: "technical_responsibles",
      ownerId: id,
      duplicateMessage:
        "Já existe um responsável técnico cadastrado com este CPF.",
    });

    if (currentCpf && currentCpf !== nextCpf) {
      await releaseUniqueDocument({
        transaction,
        db,
        type: "cpf",
        value: currentCpf,
        ownerCollection: "technical_responsibles",
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

export const deleteTechnicalResponsible = async (id: string) => {
  const docRef = doc(db, "technical_responsibles", id);

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
      ownerCollection: "technical_responsibles",
      ownerId: id,
    });

    transaction.delete(docRef);
  });
};

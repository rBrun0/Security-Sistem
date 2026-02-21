import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";
import { TrainingParticipant } from "./types";

const participantsCollection = collection(db, "training_participants");

type FirestoreDocData = {
  id?: string;
  data?: () => Record<string, unknown>;
  [key: string]: unknown;
};

function normalizeParticipant(d: FirestoreDocData): TrainingParticipant {
  const data = (d.data ? d.data() : d) as Record<string, unknown>;

  return {
    id: d.id,
    trainingId: (data.training_id ?? data.treinamento_id) as string | undefined,
    employeeId: (data.employee_id ?? data.colaborador_id) as string | undefined,
    name: (data.name ?? data.nome) as string | undefined,
    cpf: data.cpf as string | undefined,
    company: (data.company ?? data.empresa) as string | undefined,
    role: (data.role ?? data.cargo) as string | undefined,
    signatureToken: (data.signature_token ?? data.token_assinatura) as
      | string
      | undefined,
    signed: (data.signed ?? data.assinado) as boolean | undefined,
    createdAt: (data.created_at as Date | undefined) || undefined,
    updatedAt: (data.updated_at as Date | undefined) || undefined,
  };
}

function withLegacyMirrors(data: Partial<TrainingParticipant>) {
  return {
    ...data,
    training_id: data.trainingId,
    treinamento_id: data.trainingId,
    employee_id: data.employeeId,
    colaborador_id: data.employeeId,
    nome: data.name,
    empresa: data.company,
    cargo: data.role,
    signature_token: data.signatureToken,
    token_assinatura: data.signatureToken,
    signed: data.signed,
    assinado: data.signed,
  };
}

export async function getTrainingParticipants(
  trainingId: string,
): Promise<TrainingParticipant[]> {
  const q = query(
    participantsCollection,
    where("training_id", "==", trainingId),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) =>
    normalizeParticipant({ id: d.id, ...d.data(), data: () => d.data() }),
  );
}

export async function createTrainingParticipant(
  data: Omit<TrainingParticipant, "id">,
) {
  const now = Timestamp.now();

  return await addDoc(
    participantsCollection,
    removeUndefinedFields({
      ...withLegacyMirrors(data),
      created_at: now,
      updated_at: now,
    }),
  );
}

export async function createTrainingParticipants(
  data: Omit<TrainingParticipant, "id">[],
) {
  if (!data.length) return [];

  return await Promise.all(
    data.map((participant) => createTrainingParticipant(participant)),
  );
}

export async function deleteTrainingParticipant(id: string) {
  const docRef = doc(db, "training_participants", id);
  return await deleteDoc(docRef);
}

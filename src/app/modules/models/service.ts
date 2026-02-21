import {
  addDoc,
  collection,
  deleteDoc,
  DocumentData,
  doc,
  getDoc,
  getDocs,
  QueryDocumentSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";
import { TrainingModel } from "./types";

const trainingModelsCollection = collection(db, "training_models");

type FirestoreDocData = {
  id?: string;
  data?: () => Record<string, unknown>;
  [key: string]: unknown;
};

function normalizeDocData(
  d: FirestoreDocData | QueryDocumentSnapshot<DocumentData>,
): TrainingModel {
  const data = (d.data ? d.data() : d) as Record<string, unknown>;

  return {
    id: d.id,
    standard: (data.standard ?? data.norma) as string | undefined,
    name: (data.name ?? data.nome) as string | undefined,
    programContent: (data.program_content ?? data.conteudo_programatico) as
      | string
      | undefined,
    workload: (data.workload ?? data.carga_horaria) as string | undefined,
    modality: (data.modality ?? data.modalidade) as
      | "presencial"
      | "ead"
      | "semipresencial"
      | undefined,
    instructorId: (data.instructor_id ?? data.instrutor_id) as
      | string
      | undefined,
    instructorName: (data.instructor_name ?? data.instrutor_nome) as
      | string
      | undefined,
    technicalResponsibleId: (data.technical_responsible_id ??
      data.responsavel_tecnico_id) as string | undefined,
    technicalResponsibleName: (data.technical_responsible_name ??
      data.responsavel_tecnico_nome) as string | undefined,
    certificateModel: (data.certificate_model ?? data.modelo_certificado) as
      | string
      | undefined,
  } as TrainingModel;
}

function withLegacyMirrors(data: Partial<TrainingModel>) {
  return {
    ...data,
    norma: data.standard,
    nome: data.name,
    conteudo_programatico: data.programContent,
    carga_horaria: data.workload,
    modalidade: data.modality,
    instrutor_id: data.instructorId,
    instrutor_nome: data.instructorName,
    responsavel_tecnico_id: data.technicalResponsibleId,
    responsavel_tecnico_nome: data.technicalResponsibleName,
    modelo_certificado: data.certificateModel,
  };
}

export async function getTrainingModels(): Promise<TrainingModel[]> {
  const snapshot = await getDocs(trainingModelsCollection);
  return snapshot.docs.map((d) =>
    normalizeDocData({ id: d.id, ...d.data(), data: () => d.data() }),
  );
}

export async function getTrainingModelById(
  id: string,
): Promise<TrainingModel | null> {
  const docRef = doc(db, "training_models", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return normalizeDocData(snapshot);
}

export async function createTrainingModel(data: Omit<TrainingModel, "id">) {
  const now = Timestamp.now();

  return await addDoc(
    trainingModelsCollection,
    removeUndefinedFields({
      ...withLegacyMirrors(data),
      created_at: now,
      updated_at: now,
    }),
  );
}

export async function updateTrainingModel(
  id: string,
  data: Partial<TrainingModel>,
) {
  const docRef = doc(db, "training_models", id);

  return await updateDoc(
    docRef,
    removeUndefinedFields({
      ...withLegacyMirrors(data),
      updated_at: Timestamp.now(),
    }),
  );
}

export async function deleteTrainingModel(id: string) {
  await deleteDoc(doc(db, "training_models", id));
}

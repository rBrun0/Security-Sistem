import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";
import { Training } from "./types";

const trainingsCollection = collection(db, "trainings");

type FirestoreDocData = {
  id?: string;
  data?: () => Record<string, unknown>;
  [key: string]: unknown;
};

function normalizeTraining(d: FirestoreDocData): Training {
  const data = (d.data ? d.data() : d) as Record<string, unknown>;

  const status =
    (data.status as string | undefined) === "agendado"
      ? "scheduled"
      : (data.status as string | undefined) === "em_andamento"
        ? "in_progress"
        : (data.status as string | undefined) === "concluido"
          ? "completed"
          : (data.status as Training["status"] | undefined);

  return {
    id: d.id,
    title: (data.title ?? data.titulo) as string | undefined,
    standard: (data.standard ?? data.norma) as string | undefined,
    programContent: (data.program_content ?? data.conteudo_programatico) as
      | string
      | undefined,
    workload: (data.workload ?? data.carga_horaria) as string | undefined,
    location: (data.location ?? data.local) as string | undefined,
    eventDate: (data.event_date ?? data.data_realizacao) as string | undefined,
    eventTime: (data.event_time ?? data.horario) as string | undefined,
    modality: (data.modality ?? data.modalidade) as Training["modality"],
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
    environmentId: (data.environment_id ?? data.ambiente_id) as
      | string
      | undefined,
    environmentName: (data.environment_name ?? data.ambiente_nome) as
      | string
      | undefined,
    status,
    createdAt: (data.created_at as Date | undefined) || undefined,
    updatedAt: (data.updated_at as Date | undefined) || undefined,
  };
}

function withLegacyMirrors(data: Partial<Training>) {
  const statusLegacy =
    data.status === "scheduled"
      ? "agendado"
      : data.status === "in_progress"
        ? "em_andamento"
        : data.status === "completed"
          ? "concluido"
          : data.status;

  return {
    ...data,
    titulo: data.title,
    norma: data.standard,
    conteudo_programatico: data.programContent,
    carga_horaria: data.workload,
    local: data.location,
    data_realizacao: data.eventDate,
    horario: data.eventTime,
    modalidade: data.modality,
    instrutor_id: data.instructorId,
    instrutor_nome: data.instructorName,
    responsavel_tecnico_id: data.technicalResponsibleId,
    responsavel_tecnico_nome: data.technicalResponsibleName,
    modelo_certificado: data.certificateModel,
    ambiente_id: data.environmentId,
    ambiente_nome: data.environmentName,
    status: data.status,
    status_legacy: statusLegacy,
  };
}

export async function getTrainings(): Promise<Training[]> {
  const snapshot = await getDocs(trainingsCollection);

  return snapshot.docs
    .map((d) =>
      normalizeTraining({ id: d.id, ...d.data(), data: () => d.data() }),
    )
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
}

export async function getTrainingById(id: string): Promise<Training | null> {
  const docRef = doc(db, "trainings", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return normalizeTraining({
    id: snapshot.id,
    ...snapshot.data(),
    data: () => snapshot.data(),
  });
}

export async function createTraining(data: Omit<Training, "id">) {
  const now = Timestamp.now();

  return await addDoc(
    trainingsCollection,
    removeUndefinedFields({
      ...withLegacyMirrors(data),
      created_at: now,
      updated_at: now,
    }),
  );
}

export async function updateTraining(id: string, data: Partial<Training>) {
  const docRef = doc(db, "trainings", id);

  return await updateDoc(
    docRef,
    removeUndefinedFields({
      ...withLegacyMirrors(data),
      updated_at: Timestamp.now(),
    }),
  );
}

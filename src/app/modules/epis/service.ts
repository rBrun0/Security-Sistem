import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";
import { EPI } from "./types";
import { buildEPIIdentityKey } from "./identity";

const episCollection = collection(db, "epis");

const DUPLICATE_EPI_ERROR_CODE = "EPI_DUPLICATE_IN_WAREHOUSE";

export class DuplicateEPIError extends Error {
  code = DUPLICATE_EPI_ERROR_CODE;
  existingEpiId: string;

  constructor(existingEpiId: string) {
    super("Já existe um EPI com esse identificador no estoque informado.");
    this.name = "DuplicateEPIError";
    this.existingEpiId = existingEpiId;
  }
}

export function isDuplicateEPIError(
  error: unknown,
): error is DuplicateEPIError {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === DUPLICATE_EPI_ERROR_CODE,
  );
}

type FirestoreDocData = {
  id?: string;
  data?: () => Record<string, unknown>;
  [key: string]: unknown;
};

function normalizeEPI(d: FirestoreDocData): EPI {
  const data = (d.data ? d.data() : d) as Record<string, unknown>;

  return {
    id: String(d.id),
    name: (data.name ?? data.nome ?? "") as string,
    description: (data.description ?? data.descricao) as string | undefined,
    ca: (data.ca ?? "") as string,
    caValidity: (data.ca_validity ?? data.validade_ca) as string | undefined,
    category: (data.category ?? data.categoria) as EPI["category"],
    isActive: Boolean(data.isActive ?? data.ativo ?? true),
    centralWarehouseId: (data.central_warehouse_id ??
      data.estoque_central_id) as string | undefined,
    centralWarehouseName: (data.central_warehouse_name ??
      data.estoque_central_nome) as string | undefined,
    quantity: Number(data.quantity ?? data.quantidade ?? 0),
    unitValue: Number(data.unit_value ?? data.valor_unitario ?? 0),
    createdAt: (data.created_at as Date | undefined) || undefined,
    updatedAt: (data.updated_at as Date | undefined) || undefined,
  };
}

function withLegacyMirrors(data: Partial<EPI>) {
  return {
    ...data,
    nome: data.name,
    descricao: data.description,
    validade_ca: data.caValidity,
    categoria: data.category,
    ativo: data.isActive,
    estoque_central_id: data.centralWarehouseId,
    estoque_central_nome: data.centralWarehouseName,
    quantidade: data.quantity,
    valor_unitario: data.unitValue,
    ca_validity: data.caValidity,
    central_warehouse_id: data.centralWarehouseId,
    central_warehouse_name: data.centralWarehouseName,
    unit_value: data.unitValue,
  };
}

export async function getEPIs(): Promise<EPI[]> {
  const snapshot = await getDocs(episCollection);

  return snapshot.docs
    .map((d) => normalizeEPI({ id: d.id, ...d.data(), data: () => d.data() }))
    .sort((a, b) => b.name.localeCompare(a.name));
}

export async function getEPIById(id: string): Promise<EPI | null> {
  const ref = doc(db, "epis", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return normalizeEPI({
    id: snapshot.id,
    ...snapshot.data(),
    data: () => snapshot.data(),
  });
}

export async function createEPI(data: Omit<EPI, "id">) {
  const incomingKey = buildEPIIdentityKey(data);
  const snapshot = await getDocs(episCollection);
  const existingEPI = snapshot.docs
    .map((d) => normalizeEPI({ id: d.id, ...d.data(), data: () => d.data() }))
    .find((epi) => buildEPIIdentityKey(epi) === incomingKey);

  if (existingEPI) {
    throw new DuplicateEPIError(existingEPI.id);
  }

  const now = Timestamp.now();

  return await addDoc(
    episCollection,
    removeUndefinedFields({
      ...withLegacyMirrors(data),
      isActive: data.isActive ?? true,
      created_at: now,
      updated_at: now,
    }),
  );
}

export async function updateEPI(id: string, data: Partial<EPI>) {
  const currentEPI = await getEPIById(id);

  if (currentEPI) {
    const nextIdentityCandidate: EPI = {
      ...currentEPI,
      ...data,
      id,
    };
    const nextKey = buildEPIIdentityKey(nextIdentityCandidate);
    const snapshot = await getDocs(episCollection);
    const conflictingEPI = snapshot.docs
      .map((d) => normalizeEPI({ id: d.id, ...d.data(), data: () => d.data() }))
      .find((epi) => epi.id !== id && buildEPIIdentityKey(epi) === nextKey);

    if (conflictingEPI) {
      throw new DuplicateEPIError(conflictingEPI.id);
    }
  }

  const ref = doc(db, "epis", id);

  return await updateDoc(
    ref,
    removeUndefinedFields({
      ...withLegacyMirrors(data),
      updated_at: Timestamp.now(),
    }),
  );
}

export async function deleteEPI(id: string) {
  const ref = doc(db, "epis", id);
  return await deleteDoc(ref);
}

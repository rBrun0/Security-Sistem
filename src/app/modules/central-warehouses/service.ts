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
import { CentralWarehouse } from "./types";

const warehousesCollection = collection(db, "central_warehouses");

type FirestoreDocData = {
  id?: string;
  data?: () => Record<string, unknown>;
  [key: string]: unknown;
};

function normalizeWarehouse(d: FirestoreDocData): CentralWarehouse {
  const data = (d.data ? d.data() : d) as Record<string, unknown>;

  return {
    id: String(d.id),
    name: (data.name ?? data.nome ?? "") as string,
    description: (data.description ?? data.descricao) as string | undefined,
    address: (data.address ?? data.endereco) as string | undefined,
    responsible: (data.responsible ?? data.responsavel) as string | undefined,
    isActive: Boolean(data.isActive ?? data.ativo ?? true),
    createdAt: (data.created_at as Date | undefined) || undefined,
    updatedAt: (data.updated_at as Date | undefined) || undefined,
  };
}

function withLegacyMirrors(data: Partial<CentralWarehouse>) {
  return {
    ...data,
    nome: data.name,
    descricao: data.description,
    endereco: data.address,
    responsavel: data.responsible,
    ativo: data.isActive,
  };
}

export async function getCentralWarehouses(): Promise<CentralWarehouse[]> {
  const snapshot = await getDocs(warehousesCollection);

  return snapshot.docs
    .map((d) =>
      normalizeWarehouse({ id: d.id, ...d.data(), data: () => d.data() }),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCentralWarehouseById(
  id: string,
): Promise<CentralWarehouse | null> {
  const ref = doc(db, "central_warehouses", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return normalizeWarehouse({
    id: snapshot.id,
    ...snapshot.data(),
    data: () => snapshot.data(),
  });
}

export async function createCentralWarehouse(
  data: Omit<CentralWarehouse, "id">,
) {
  const now = Timestamp.now();

  return await addDoc(
    warehousesCollection,
    removeUndefinedFields({
      ...withLegacyMirrors(data),
      created_at: now,
      updated_at: now,
    }),
  );
}

export async function updateCentralWarehouse(
  id: string,
  data: Partial<CentralWarehouse>,
) {
  const ref = doc(db, "central_warehouses", id);

  return await updateDoc(
    ref,
    removeUndefinedFields({
      ...withLegacyMirrors(data),
      updated_at: Timestamp.now(),
    }),
  );
}

export async function deleteCentralWarehouse(id: string) {
  const ref = doc(db, "central_warehouses", id);
  return await deleteDoc(ref);
}

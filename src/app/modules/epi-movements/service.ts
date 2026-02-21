import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";
import { EPIMovement } from "./types";

const movementsCollection = collection(db, "epi_movements");

type FirestoreDocData = {
  id?: string;
  data?: () => Record<string, unknown>;
  [key: string]: unknown;
};

function normalizeMovement(d: FirestoreDocData): EPIMovement {
  const data = (d.data ? d.data() : d) as Record<string, unknown>;

  return {
    id: String(d.id),
    type: (data.type ?? data.tipo ?? "entrada") as EPIMovement["type"],
    epiId: (data.epi_id ?? "") as string,
    epiName: (data.epi_name ?? data.epi_nome ?? "") as string,
    quantity: Number(data.quantity ?? data.quantidade ?? 0),
    unitValue: Number(data.unit_value ?? data.valor_unitario ?? 0),
    totalValue: Number(data.total_value ?? data.valor_total ?? 0),
    originWarehouseId: (data.origin_warehouse_id ?? data.estoque_origem_id) as
      | string
      | undefined,
    originWarehouseName: (data.origin_warehouse_name ??
      data.estoque_origem_nome) as string | undefined,
    destinationWarehouseId: (data.destination_warehouse_id ??
      data.estoque_destino_id) as string | undefined,
    destinationWarehouseName: (data.destination_warehouse_name ??
      data.estoque_destino_nome) as string | undefined,
    destinationEnvironmentId: (data.destination_environment_id ??
      data.obra_destino_id) as string | undefined,
    destinationEnvironmentName: (data.destination_environment_name ??
      data.obra_destino_nome) as string | undefined,
    movementDate: (data.movement_date ?? data.data_movimentacao) as
      | string
      | undefined,
    observation: (data.observation ?? data.observacao) as string | undefined,
    createdAt: (data.created_at as Date | undefined) || undefined,
  };
}

function withLegacyMirrors(data: Partial<EPIMovement>) {
  return {
    ...data,
    tipo: data.type,
    epi_nome: data.epiName,
    quantidade: data.quantity,
    valor_unitario: data.unitValue,
    valor_total: data.totalValue,
    estoque_origem_id: data.originWarehouseId,
    estoque_origem_nome: data.originWarehouseName,
    estoque_destino_id: data.destinationWarehouseId,
    estoque_destino_nome: data.destinationWarehouseName,
    obra_destino_id: data.destinationEnvironmentId,
    obra_destino_nome: data.destinationEnvironmentName,
    data_movimentacao: data.movementDate,
    observacao: data.observation,
  };
}

export async function getEPIMovements(): Promise<EPIMovement[]> {
  const snapshot = await getDocs(movementsCollection);

  return snapshot.docs
    .map((d) =>
      normalizeMovement({ id: d.id, ...d.data(), data: () => d.data() }),
    )
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
}

export async function createEPIMovement(data: Omit<EPIMovement, "id">) {
  return await addDoc(
    movementsCollection,
    removeUndefinedFields({
      ...withLegacyMirrors(data),
      created_at: Timestamp.now(),
    }),
  );
}

import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";
import { EPIMovement } from "./types";
import { EPI } from "../epis/types";
import { todayLocalISODate } from "@/src/lib/date";

const movementsCollection = collection(db, "epi_movements");
const episCollection = collection(db, "epis");

const STOCK_MOVEMENT_ERROR_CODE = "STOCK_MOVEMENT_ERROR";

export class StockMovementError extends Error {
  code = STOCK_MOVEMENT_ERROR_CODE;

  constructor(message: string) {
    super(message);
    this.name = "StockMovementError";
  }
}

export function isStockMovementError(
  error: unknown,
): error is StockMovementError {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === STOCK_MOVEMENT_ERROR_CODE,
  );
}

type FirestoreDocData = {
  id?: string;
  data?: () => Record<string, unknown>;
  [key: string]: unknown;
};

function normalizeIdentityValue(value?: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

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

function withEpiLegacyMirrors(data: Partial<EPI>) {
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

async function findEPIInWarehouseByIdentity(
  warehouseId: string,
  name: string,
  ca?: string,
  ignoreEpiId?: string,
): Promise<EPI | null> {
  const warehouseQuery = query(
    episCollection,
    where("central_warehouse_id", "==", warehouseId),
  );
  const snapshot = await getDocs(warehouseQuery);

  const normalizedName = normalizeIdentityValue(name);
  const normalizedCa = normalizeIdentityValue(ca);

  const found = snapshot.docs
    .map((entry) =>
      normalizeEPI({ id: entry.id, ...entry.data(), data: () => entry.data() }),
    )
    .find((epi) => {
      if (ignoreEpiId && epi.id === ignoreEpiId) return false;

      return (
        normalizeIdentityValue(epi.name) === normalizedName &&
        normalizeIdentityValue(epi.ca) === normalizedCa
      );
    });

  return found ?? null;
}

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

export async function applyEPIMovement(data: Omit<EPIMovement, "id">) {
  if (data.quantity <= 0) {
    throw new StockMovementError(
      "A quantidade da movimentação deve ser maior que zero.",
    );
  }

  const movementDate = data.movementDate ?? todayLocalISODate();

  return await runTransaction(db, async (transaction) => {
    const epiRef = doc(db, "epis", data.epiId);
    const epiSnapshot = await transaction.get(epiRef);

    if (!epiSnapshot.exists()) {
      throw new StockMovementError("EPI não encontrado para movimentação.");
    }

    const sourceEPI = normalizeEPI({
      id: epiSnapshot.id,
      ...epiSnapshot.data(),
      data: () => epiSnapshot.data(),
    });

    const sourceQuantity = sourceEPI.quantity || 0;

    if (data.type === "entrada") {
      if (!data.destinationWarehouseId) {
        throw new StockMovementError(
          "Movimentação de entrada exige estoque de destino.",
        );
      }

      if (
        sourceEPI.centralWarehouseId &&
        sourceEPI.centralWarehouseId !== data.destinationWarehouseId
      ) {
        throw new StockMovementError(
          "Esse EPI pertence a outro estoque. Faça transferência em vez de entrada.",
        );
      }

      transaction.update(
        epiRef,
        removeUndefinedFields({
          ...withEpiLegacyMirrors({
            quantity: sourceQuantity + data.quantity,
            isActive: true,
            centralWarehouseId:
              sourceEPI.centralWarehouseId ?? data.destinationWarehouseId,
            centralWarehouseName:
              sourceEPI.centralWarehouseName ?? data.destinationWarehouseName,
            unitValue: data.unitValue || sourceEPI.unitValue,
          }),
          updated_at: Timestamp.now(),
        }),
      );
    }

    if (data.type === "saida") {
      const expectedOriginWarehouseId =
        data.originWarehouseId ?? sourceEPI.centralWarehouseId;

      if (!expectedOriginWarehouseId) {
        throw new StockMovementError(
          "Movimentação de saída exige estoque de origem.",
        );
      }

      if (
        sourceEPI.centralWarehouseId &&
        sourceEPI.centralWarehouseId !== expectedOriginWarehouseId
      ) {
        throw new StockMovementError(
          "EPI não pertence ao estoque de origem informado.",
        );
      }

      if (data.quantity > sourceQuantity) {
        throw new StockMovementError(
          "Quantidade indisponível em estoque para saída.",
        );
      }

      transaction.update(
        epiRef,
        removeUndefinedFields({
          ...withEpiLegacyMirrors({
            quantity: Math.max(0, sourceQuantity - data.quantity),
          }),
          updated_at: Timestamp.now(),
        }),
      );
    }

    if (data.type === "transferencia") {
      if (!data.originWarehouseId || !data.destinationWarehouseId) {
        throw new StockMovementError(
          "Movimentação de transferência exige estoque de origem e destino.",
        );
      }

      if (data.originWarehouseId === data.destinationWarehouseId) {
        throw new StockMovementError("Origem e destino não podem ser iguais.");
      }

      if (
        sourceEPI.centralWarehouseId &&
        sourceEPI.centralWarehouseId !== data.originWarehouseId
      ) {
        throw new StockMovementError(
          "EPI não pertence ao estoque de origem informado.",
        );
      }

      if (data.quantity > sourceQuantity) {
        throw new StockMovementError(
          "Quantidade indisponível em estoque para transferência.",
        );
      }

      const remainingQuantity = sourceQuantity - data.quantity;

      const destinationEPI = await findEPIInWarehouseByIdentity(
        data.destinationWarehouseId,
        sourceEPI.name,
        sourceEPI.ca,
        sourceEPI.id,
      );

      if (destinationEPI?.id) {
        const destinationRef = doc(db, "epis", destinationEPI.id);

        transaction.update(
          epiRef,
          removeUndefinedFields({
            ...withEpiLegacyMirrors({
              quantity: Math.max(0, remainingQuantity),
            }),
            updated_at: Timestamp.now(),
          }),
        );

        transaction.update(
          destinationRef,
          removeUndefinedFields({
            ...withEpiLegacyMirrors({
              isActive: true,
              quantity: (destinationEPI.quantity || 0) + data.quantity,
              unitValue: sourceEPI.unitValue,
            }),
            updated_at: Timestamp.now(),
          }),
        );
      } else if (remainingQuantity === 0) {
        transaction.update(
          epiRef,
          removeUndefinedFields({
            ...withEpiLegacyMirrors({
              centralWarehouseId: data.destinationWarehouseId,
              centralWarehouseName: data.destinationWarehouseName,
              quantity: sourceQuantity,
            }),
            updated_at: Timestamp.now(),
          }),
        );
      } else {
        transaction.update(
          epiRef,
          removeUndefinedFields({
            ...withEpiLegacyMirrors({
              quantity: Math.max(0, remainingQuantity),
            }),
            updated_at: Timestamp.now(),
          }),
        );

        const newEpiRef = doc(episCollection);
        transaction.set(
          newEpiRef,
          removeUndefinedFields({
            ...withEpiLegacyMirrors({
              name: sourceEPI.name,
              description: sourceEPI.description,
              ca: sourceEPI.ca,
              caValidity: sourceEPI.caValidity,
              category: sourceEPI.category,
              isActive: true,
              centralWarehouseId: data.destinationWarehouseId,
              centralWarehouseName: data.destinationWarehouseName,
              quantity: data.quantity,
              unitValue: sourceEPI.unitValue,
            }),
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
          }),
        );
      }
    }

    const movementRef = doc(movementsCollection);
    transaction.set(
      movementRef,
      removeUndefinedFields({
        ...withLegacyMirrors({
          ...data,
          movementDate,
        }),
        created_at: Timestamp.now(),
      }),
    );

    return movementRef.id;
  });
}

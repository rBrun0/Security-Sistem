import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";
import { EPIDelivery, EPIDeliveryItem } from "./types";

const deliveriesCollection = collection(db, "epi_deliveries");

type FirestoreDocData = {
  id?: string;
  data?: () => Record<string, unknown>;
  [key: string]: unknown;
};

function normalizeItems(items: unknown): EPIDeliveryItem[] {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const data = item as Record<string, unknown>;

    return {
      epiId: (data.epi_id ?? data.epiId ?? "") as string,
      epiName: (data.epi_nome ?? data.epiName ?? "") as string,
      ca: (data.ca ?? "") as string,
      quantity: Number(data.quantidade ?? data.quantity ?? 0),
      unitValue: Number(data.valor_unitario ?? data.unitValue ?? 0),
    };
  });
}

function normalizeDelivery(d: FirestoreDocData): EPIDelivery {
  const data = (d.data ? d.data() : d) as Record<string, unknown>;

  return {
    id: String(d.id),
    employeeId: (data.employee_id ?? data.trabalhador_id ?? "") as string,
    employeeName: (data.employee_name ?? data.trabalhador_nome ?? "") as string,
    employeeCpf: (data.employee_cpf ?? data.trabalhador_cpf) as
      | string
      | undefined,
    environmentId: (data.environment_id ?? data.obra_id ?? "") as string,
    environmentName: (data.environment_name ?? data.obra_nome ?? "") as string,
    items: normalizeItems(data.items ?? data.itens),
    deliveryDate: (data.delivery_date ?? data.data_entrega ?? "") as string,
    deliveryResponsible: (data.delivery_responsible ??
      data.responsavel_entrega ??
      "") as string,
    signatureToken: (data.signature_token ??
      data.token_assinatura ??
      "") as string,
    status: (data.status ?? "pendente") as EPIDelivery["status"],
    createdAt: (data.created_at as Date | undefined) || undefined,
  };
}

function withLegacyMirrors(data: Partial<EPIDelivery>) {
  return {
    ...data,
    trabalhador_id: data.employeeId,
    trabalhador_nome: data.employeeName,
    trabalhador_cpf: data.employeeCpf,
    obra_id: data.environmentId,
    obra_nome: data.environmentName,
    itens: data.items?.map((item) => ({
      epi_id: item.epiId,
      epi_nome: item.epiName,
      ca: item.ca,
      quantidade: item.quantity,
      valor_unitario: item.unitValue,
    })),
    data_entrega: data.deliveryDate,
    responsavel_entrega: data.deliveryResponsible,
    token_assinatura: data.signatureToken,
  };
}

export async function getEPIDeliveries(): Promise<EPIDelivery[]> {
  const snapshot = await getDocs(deliveriesCollection);

  return snapshot.docs
    .map((d) =>
      normalizeDelivery({ id: d.id, ...d.data(), data: () => d.data() }),
    )
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
}

export async function createEPIDelivery(data: Omit<EPIDelivery, "id">) {
  return await addDoc(
    deliveriesCollection,
    removeUndefinedFields({
      ...withLegacyMirrors(data),
      created_at: Timestamp.now(),
    }),
  );
}

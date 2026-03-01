import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { Inspection } from "./types";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";

const collectionRef = collection(db, "inspections");

export type CreateInspectionInput = {
  environment_id: string;
  inspection_date: string;
  status: Inspection["status"];
  isActive?: boolean;
  observations?: string;
  environment_name?: string;
  total_items?: number;
  conforming_items?: number;
  non_conforming_items?: number;
  conformity_percentage?: number;
};

export type UpdateInspectionInput = Partial<CreateInspectionInput>;

type FirestoreDocData = {
  id?: string;
  data?: () => Record<string, unknown>;
  [key: string]: unknown;
};

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return new Date();
}

function normalizeInspection(d: FirestoreDocData): Inspection {
  const data = (d.data ? d.data() : d) as Record<string, unknown>;

  return {
    id: String(d.id),
    environment_id: String(data.environment_id ?? ""),
    environment_name:
      (data.environment_name as string | undefined) ?? undefined,
    inspection_date: String(data.inspection_date ?? ""),
    observations: (data.observations as string | undefined) ?? undefined,
    status: (data.status ?? "pending") as Inspection["status"],
    isActive: Boolean(data.isActive ?? true),
    total_items: Number(data.total_items ?? 0),
    conforming_items: Number(data.conforming_items ?? 0),
    non_conforming_items: Number(data.non_conforming_items ?? 0),
    conformity_percentage: Number(data.conformity_percentage ?? 0),
    created_at: toDate(data.created_at),
    updated_at: toDate(data.updated_at),
  };
}

export async function createInspection(data: CreateInspectionInput) {
  const now = Timestamp.now();

  return await addDoc(
    collectionRef,
    removeUndefinedFields({
      ...data,
      isActive: data.isActive ?? true,
      total_items: data.total_items ?? 0,
      conforming_items: data.conforming_items ?? 0,
      non_conforming_items: data.non_conforming_items ?? 0,
      conformity_percentage: data.conformity_percentage ?? 0,
      created_at: now,
      updated_at: now,
    }),
  );
}

export async function getInspections() {
  const snapshot = await getDocs(collectionRef);

  return snapshot.docs
    .map((d) =>
      normalizeInspection({ id: d.id, ...d.data(), data: () => d.data() }),
    )
    .sort((a, b) => b.inspection_date.localeCompare(a.inspection_date));
}

export async function updateInspection(
  id: string,
  data: UpdateInspectionInput,
) {
  const ref = doc(db, "inspections", id);
  return await updateDoc(
    ref,
    removeUndefinedFields({
      ...data,
      updated_at: Timestamp.now(),
    }),
  );
}

export async function deleteInspection(id: string) {
  const ref = doc(db, "inspections", id);
  return await updateDoc(
    ref,
    removeUndefinedFields({
      isActive: false,
      updated_at: Timestamp.now(),
    }),
  );
}

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { Inspection } from "./types";
import type { InspectionPhotoFinding } from "./types";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";

const collectionRef = collection(db, "inspections");

export type CreateInspectionInput = {
  environment_id: string;
  inspection_date: string;
  status: Inspection["status"];
  isActive?: boolean;
  record_status?: Inspection["record_status"];
  observations?: string;
  irregularity?: string;
  technical_basis?: string;
  technical_standard?: string;
  photo_urls?: string[];
  photo_findings?: InspectionPhotoFinding[];
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

function sanitizePhotoFindings(findings?: InspectionPhotoFinding[]) {
  if (!Array.isArray(findings)) {
    return findings;
  }

  return findings.map((finding) => {
    const normalizedNormativeItemRef = finding.normative_item_ref?.trim();

    return {
      photo_url: finding.photo_url,
      irregularity: finding.irregularity,
      technical_standard: finding.technical_standard,
      technical_basis: finding.technical_basis,
      ...(normalizedNormativeItemRef
        ? { normative_item_ref: normalizedNormativeItemRef }
        : {}),
    };
  });
}

function sanitizeInspectionInput<
  T extends UpdateInspectionInput | CreateInspectionInput,
>(data: T): T {
  return {
    ...data,
    photo_findings: sanitizePhotoFindings(data.photo_findings),
  };
}

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
    irregularity: (data.irregularity as string | undefined) ?? undefined,
    technical_basis: (data.technical_basis as string | undefined) ?? undefined,
    technical_standard:
      (data.technical_standard as string | undefined) ?? undefined,
    photo_urls: Array.isArray(data.photo_urls)
      ? (data.photo_urls as string[])
      : [],
    photo_findings: Array.isArray(data.photo_findings)
      ? (data.photo_findings as InspectionPhotoFinding[])
      : [],
    status: (data.status ?? "pending") as Inspection["status"],
    record_status: (data.record_status ??
      "active") as Inspection["record_status"],
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
  const sanitizedData = sanitizeInspectionInput(data);

  return await addDoc(
    collectionRef,
    removeUndefinedFields({
      ...sanitizedData,
      isActive: sanitizedData.isActive ?? true,
      record_status: sanitizedData.record_status ?? "active",
      total_items: sanitizedData.total_items ?? 0,
      conforming_items: sanitizedData.conforming_items ?? 0,
      non_conforming_items: sanitizedData.non_conforming_items ?? 0,
      conformity_percentage: sanitizedData.conformity_percentage ?? 0,
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

export async function getInspectionById(
  id: string,
): Promise<Inspection | null> {
  const ref = doc(db, "inspections", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeInspection({
    id: snapshot.id,
    ...snapshot.data(),
    data: () => snapshot.data(),
  });
}

export async function createInspectionDraft(
  initial?: Partial<CreateInspectionInput>,
) {
  const now = Timestamp.now();

  return await addDoc(
    collectionRef,
    removeUndefinedFields({
      environment_id: initial?.environment_id ?? "",
      environment_name: initial?.environment_name,
      inspection_date: initial?.inspection_date ?? "",
      status: initial?.status ?? "pending",
      record_status: "draft",
      observations: initial?.observations,
      irregularity: initial?.irregularity,
      technical_basis: initial?.technical_basis,
      technical_standard: initial?.technical_standard,
      photo_urls: initial?.photo_urls ?? [],
      photo_findings: initial?.photo_findings ?? [],
      isActive: true,
      total_items: 0,
      conforming_items: 0,
      non_conforming_items: 0,
      conformity_percentage: 0,
      created_at: now,
      updated_at: now,
    }),
  );
}

export async function saveInspectionDraft(
  id: string,
  data: UpdateInspectionInput,
) {
  const ref = doc(db, "inspections", id);
  const sanitizedData = sanitizeInspectionInput(data);

  return await updateDoc(
    ref,
    removeUndefinedFields({
      ...sanitizedData,
      record_status: "draft",
      updated_at: Timestamp.now(),
    }),
  );
}

export async function publishInspection(
  id: string,
  data: UpdateInspectionInput,
) {
  const ref = doc(db, "inspections", id);
  const sanitizedData = sanitizeInspectionInput(data);

  return await updateDoc(
    ref,
    removeUndefinedFields({
      ...sanitizedData,
      record_status: "active",
      isActive: true,
      updated_at: Timestamp.now(),
    }),
  );
}

export async function uploadInspectionPhotos(
  inspectionId: string,
  files: File[],
): Promise<string[]> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary não configurado");
  }

  const uploadedUrls: string[] = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", `inspections/${inspectionId}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Falha no upload para o Cloudinary");
    }

    const data = (await response.json()) as { secure_url?: string };
    const url = data.secure_url;

    if (!url) {
      throw new Error("Cloudinary retornou URL inválida");
    }

    uploadedUrls.push(url);
  }

  return uploadedUrls;
}

export async function updateInspection(
  id: string,
  data: UpdateInspectionInput,
) {
  const ref = doc(db, "inspections", id);
  const sanitizedData = sanitizeInspectionInput(data);
  return await updateDoc(
    ref,
    removeUndefinedFields({
      ...sanitizedData,
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

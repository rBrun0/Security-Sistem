import {
  collection,
  getDocs,
  doc,
  query,
  where,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { Company } from "./types";
import { db } from "@/src/lib/firebase";
import {
  normalizeOptionalPhoneValue,
  removeUndefinedFields,
} from "@/lib/utils";
import {
  normalizeUniqueDocument,
  reserveUniqueDocument,
} from "../shared/document-uniqueness";

const collectionRef = collection(db, "companies");

export async function createCompany(data: Omit<Company, "id" | "created_at">) {
  const normalizedPhone = normalizeOptionalPhoneValue(data.phone);
  const normalizedDocument = normalizeUniqueDocument("cnpj", data.document);
  const newCompanyRef = doc(collectionRef);

  await runTransaction(db, async (transaction) => {
    await reserveUniqueDocument({
      transaction,
      db,
      type: "cnpj",
      value: normalizedDocument,
      ownerCollection: "companies",
      ownerId: newCompanyRef.id,
      duplicateMessage: "Já existe uma empresa cadastrada com este CNPJ.",
    });

    transaction.set(
      newCompanyRef,
      removeUndefinedFields({
        ...data,
        document: normalizedDocument,
        phone: normalizedPhone,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      }),
    );
  });

  return newCompanyRef;
}

export async function getActiveCompanies() {
  const q = query(collectionRef, where("status", "==", "active"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Company[];
}

export async function updateCompany(id: string, data: Partial<Company>) {
  const normalizedPhone = normalizeOptionalPhoneValue(data.phone);
  const ref = doc(db, "companies", id);
  const normalizedDocument =
    data.document !== undefined
      ? normalizeUniqueDocument("cnpj", data.document)
      : undefined;

  return await runTransaction(db, async (transaction) => {
    const currentSnapshot = await transaction.get(ref);

    if (!currentSnapshot.exists()) {
      throw new Error("Empresa não encontrada.");
    }

    const currentData = currentSnapshot.data() as Record<string, unknown>;
    const currentDocument = normalizeUniqueDocument(
      "cnpj",
      String(currentData.document ?? ""),
    );
    const nextDocument =
      normalizedDocument && normalizedDocument.length > 0
        ? normalizedDocument
        : currentDocument;

    await reserveUniqueDocument({
      transaction,
      db,
      type: "cnpj",
      value: nextDocument,
      ownerCollection: "companies",
      ownerId: id,
      duplicateMessage: "Já existe uma empresa cadastrada com este CNPJ.",
    });

    transaction.update(
      ref,
      removeUndefinedFields({
        ...data,
        document: normalizedDocument,
        phone: normalizedPhone,
        updated_at: Timestamp.now(),
      }),
    );
  });
}

export async function softDeleteCompany(id: string) {
  return updateCompany(id, { status: "deleted" });
}

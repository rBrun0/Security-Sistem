import { doc, Timestamp, Transaction, Firestore } from "firebase/firestore";
import { onlyDigits } from "@/lib/utils";

export type UniqueDocumentType = "cpf" | "rg" | "cnpj";

type ReserveUniqueDocumentParams = {
  transaction: Transaction;
  db: Firestore;
  type: UniqueDocumentType;
  value?: string | null;
  ownerCollection: string;
  ownerId: string;
  duplicateMessage: string;
};

type ReleaseUniqueDocumentParams = {
  transaction: Transaction;
  db: Firestore;
  type: UniqueDocumentType;
  value?: string | null;
  ownerCollection: string;
  ownerId: string;
};

function normalizeRG(value?: string | null): string {
  return (value ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function normalizeUniqueDocument(
  type: UniqueDocumentType,
  value?: string | null,
): string {
  if (type === "cpf" || type === "cnpj") {
    return onlyDigits(value ?? "");
  }

  return normalizeRG(value);
}

function getUniqueDocumentRef(
  db: Firestore,
  type: UniqueDocumentType,
  normalizedValue: string,
) {
  return doc(db, "unique_documents", `${type}_${normalizedValue}`);
}

export async function reserveUniqueDocument({
  transaction,
  db,
  type,
  value,
  ownerCollection,
  ownerId,
  duplicateMessage,
}: ReserveUniqueDocumentParams): Promise<string> {
  const normalizedValue = normalizeUniqueDocument(type, value);
  if (!normalizedValue) return "";

  const uniqueDocRef = getUniqueDocumentRef(db, type, normalizedValue);
  const uniqueDocSnap = await transaction.get(uniqueDocRef);

  if (uniqueDocSnap.exists()) {
    const uniqueData = uniqueDocSnap.data() as {
      ownerCollection?: string;
      ownerId?: string;
    };

    const isSameOwner =
      uniqueData.ownerCollection === ownerCollection &&
      uniqueData.ownerId === ownerId;

    if (!isSameOwner) {
      throw new Error(duplicateMessage);
    }
  }

  transaction.set(
    uniqueDocRef,
    {
      type,
      value: normalizedValue,
      ownerCollection,
      ownerId,
      updated_at: Timestamp.now(),
      created_at: uniqueDocSnap.exists()
        ? (uniqueDocSnap.data()?.created_at ?? Timestamp.now())
        : Timestamp.now(),
    },
    { merge: true },
  );

  return normalizedValue;
}

export async function releaseUniqueDocument({
  transaction,
  db,
  type,
  value,
  ownerCollection,
  ownerId,
}: ReleaseUniqueDocumentParams): Promise<void> {
  const normalizedValue = normalizeUniqueDocument(type, value);
  if (!normalizedValue) return;

  const uniqueDocRef = getUniqueDocumentRef(db, type, normalizedValue);
  const uniqueDocSnap = await transaction.get(uniqueDocRef);

  if (!uniqueDocSnap.exists()) return;

  const uniqueData = uniqueDocSnap.data() as {
    ownerCollection?: string;
    ownerId?: string;
  };

  const isSameOwner =
    uniqueData.ownerCollection === ownerCollection &&
    uniqueData.ownerId === ownerId;

  if (isSameOwner) {
    transaction.delete(uniqueDocRef);
  }
}

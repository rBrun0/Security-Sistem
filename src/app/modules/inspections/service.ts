import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Inspection } from "./types";
import { db } from "@/src/lib/firebase";
import { removeUndefinedFields } from "@/lib/utils";

const collectionRef = collection(db, "inspections");

export type CreateInspectionInput = {
  environment_id: string;
  inspection_date: string;
  status: Inspection["status"];
  observations?: string;
  environment_name?: string;
  total_items?: number;
  conforming_items?: number;
  non_conforming_items?: number;
  conformity_percentage?: number;
};

export type UpdateInspectionInput = Partial<CreateInspectionInput>;

export async function createInspection(data: CreateInspectionInput) {
  return await addDoc(
    collectionRef,
    removeUndefinedFields({
      ...data,
      total_items: data.total_items ?? 0,
      conforming_items: data.conforming_items ?? 0,
      non_conforming_items: data.non_conforming_items ?? 0,
      conformity_percentage: data.conformity_percentage ?? 0,
      created_at: new Date(),
    }),
  );
}

export async function getInspections() {
  const snapshot = await getDocs(collectionRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Inspection[];
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
      updated_at: new Date(),
    }),
  );
}

export async function deleteInspection(id: string) {
  const ref = doc(db, "inspections", id);
  return await deleteDoc(ref);
}

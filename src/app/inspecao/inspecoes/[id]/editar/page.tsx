"use client";

import { useParams } from "next/navigation";
import { InspectionFormPage } from "../../inspection-form-page";

export default function EditarInspecaoPage() {
  const params = useParams<{ id: string }>();

  return <InspectionFormPage mode="edit" inspectionId={params.id} />;
}

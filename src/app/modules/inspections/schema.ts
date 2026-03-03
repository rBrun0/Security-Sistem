import { z } from "zod";

export const inspectionPhotoFindingSchema = z.object({
  photo_url: z.url("Foto inválida."),
  irregularity: z.string().trim().min(1, "Informe a irregularidade da foto."),
  technical_standard: z.string().trim().min(1, "Selecione a norma técnica."),
  technical_basis: z.string().trim().min(1, "Informe o embasamento técnico."),
  normative_item_ref: z.string().trim().optional(),
});

export const inspectionSchema = z.object({
  environment_id: z.string().trim().min(1, "Selecione a obra."),
  inspection_date: z.string().trim().min(1, "Informe a data da inspeção."),
  observations: z.string().trim().optional(),
  irregularity: z.string().trim().optional(),
  technical_basis: z.string().trim().optional(),
  technical_standard: z.string().trim().optional(),
  photo_urls: z.array(z.url("Foto inválida.")).default([]),
  photo_findings: z.array(inspectionPhotoFindingSchema).default([]),
  status: z.enum(["pending", "completed", "approved"], {
    error: "Status inválido.",
  }),
});

export type InspectionForm = z.input<typeof inspectionSchema>;
export type InspectionFormOutput = z.output<typeof inspectionSchema>;
export type InspectionPhotoFindingForm = z.input<
  typeof inspectionPhotoFindingSchema
>;

import { z } from "zod";

export const inspectionSchema = z.object({
  environment_id: z.string().trim().min(1, "Selecione a obra."),
  inspection_date: z.string().trim().min(1, "Informe a data da inspeção."),
  observations: z.string().trim().optional(),
  irregularity: z.string().trim().optional(),
  technical_basis: z.string().trim().optional(),
  technical_standard: z.string().trim().optional(),
  photo_urls: z.array(z.string().url()).default([]),
  status: z.enum(["pending", "completed", "approved"], {
    error: "Status inválido.",
  }),
});

export type InspectionForm = z.input<typeof inspectionSchema>;
export type InspectionFormOutput = z.output<typeof inspectionSchema>;

import { z } from "zod";

export const inspectionSchema = z.object({
  environment_id: z.string().trim().min(1, "Selecione a obra."),
  inspection_date: z.string().trim().min(1, "Informe a data da inspeção."),
  observations: z.string().trim().optional(),
  status: z.enum(["pending", "completed", "approved"], {
    error: "Status inválido.",
  }),
});

export type InspectionForm = z.infer<typeof inspectionSchema>;

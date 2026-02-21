import { z } from "zod";

export const inspectionSchema = z.object({
  environment_id: z.string().min(1, "Obra é obrigatória"),
  inspection_date: z.string().min(1, "Data é obrigatória"),
  observations: z.string().optional(),
  status: z.enum(["pending", "completed", "approved"]),
});

export type InspectionForm = z.infer<typeof inspectionSchema>;

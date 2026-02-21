import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  document: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "deleted"]),
});

export type CompanyForm = z.infer<typeof companySchema>;

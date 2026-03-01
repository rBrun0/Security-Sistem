import { isOptionalValidPhone, isValidCNPJ } from "@/lib/utils";
import { z } from "zod";

export const companySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da empresa."),
  document: z
    .string()
    .trim()
    .min(1, "Informe o CNPJ da empresa.")
    .refine(isValidCNPJ, "CNPJ inválido."),
  description: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  contact_name: z.string().trim().optional(),
  phone: z
    .string()
    .optional()
    .refine(isOptionalValidPhone, "Telefone inválido."),
  status: z.enum(["active", "inactive", "deleted"], {
    error: "Status inválido.",
  }),
});

export type CompanyForm = z.infer<typeof companySchema>;

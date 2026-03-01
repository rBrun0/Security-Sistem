import { isOptionalValidPhone, isValidCPF } from "@/lib/utils";
import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do colaborador."),
  cpf: z
    .string()
    .trim()
    .min(1, "Informe o CPF do colaborador.")
    .refine(isValidCPF, "CPF inválido."),
  rg: z.string().trim().optional(),
  job_title: z.string().trim().optional(),
  role: z.string().trim().optional(),
  company: z.string().trim().optional(),
  environment_id: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(isOptionalValidPhone, "Telefone inválido."),
  email: z
    .string()
    .trim()
    .email("E-mail inválido.")
    .optional()
    .or(z.literal("")),
  admission_date: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"], {
    error: "Status inválido.",
  }),
});

export type EmployeeForm = z.infer<typeof employeeSchema>;

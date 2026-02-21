import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(1, "CPF é obrigatório"),
  rg: z.string().optional(),
  job_title: z.string().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  environment_id: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  admission_date: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]),
});

export type EmployeeForm = z.infer<typeof employeeSchema>;

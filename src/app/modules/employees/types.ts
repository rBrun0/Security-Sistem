type EmployeeStatus = "active" | "inactive" | "on_leave";

export type Employee = {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  job_title: string; // cargo
  role: string; // função
  company: string;
  environment_id: string;
  phone: string;
  email: string;
  admission_date: Date;
  status: EmployeeStatus;
  created_at: Date;
  updated_at: Date;
};

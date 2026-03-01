export type CompanyStatus = "active" | "inactive" | "deleted";

export type Company = {
  id: string;
  name: string;
  document: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  contact_name?: string;
  phone?: string;
  status: CompanyStatus;
  created_at: Date;
  updated_at?: Date;
};

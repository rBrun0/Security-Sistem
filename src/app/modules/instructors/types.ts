export interface ProfessionalRegistration {
  type?: string;
  number?: string;
  mte?: string;
}

export interface Instructor {
  id?: string;
  name?: string;
  cpf?: string;
  phoneNumber?: string;
  email?: string;
  qualifications?: string;
  professionalRegistrations?: ProfessionalRegistration[];
}

// Backwards compatibility aliases (some older files import Portuguese names)
export type RegistroProfissional = ProfessionalRegistration;
export type Instrutor = Instructor;

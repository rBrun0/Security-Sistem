export interface TrainingParticipant {
  id?: string;
  trainingId?: string;
  employeeId?: string;
  name?: string;
  cpf?: string;
  company?: string;
  role?: string;
  signatureToken?: string;
  signed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

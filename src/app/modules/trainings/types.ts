import { TrainingModality } from "../models/types";

export type TrainingStatus = "scheduled" | "in_progress" | "completed";

export interface Training {
  id?: string;
  title?: string;
  standard?: string;
  programContent?: string;
  workload?: string;
  location?: string;
  eventDate?: string;
  eventTime?: string;
  modality?: TrainingModality;
  instructorId?: string;
  instructorName?: string;
  technicalResponsibleId?: string;
  technicalResponsibleName?: string;
  certificateModel?: string;
  environmentId?: string;
  environmentName?: string;
  status?: TrainingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

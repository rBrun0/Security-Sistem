export type TrainingModality = "presencial" | "ead" | "semipresencial";

export interface TrainingModel {
  id?: string;
  standard?: string;
  name?: string;
  programContent?: string;
  workload?: string;
  modality?: TrainingModality;
  instructorId?: string;
  instructorName?: string;
  technicalResponsibleId?: string;
  technicalResponsibleName?: string;
  certificateModel?: string;
}

export const queryKeys = {
  companies: ["companies"] as const,
  environments: ["environments"] as const,
  employees: ["employees"] as const,
  instructors: ["instructors"] as const,
  technicalResponsibles: ["technical_responsibles"] as const,
  trainingModels: ["training-models"] as const,
  trainings: ["trainings"] as const,
  training: ["training"] as const,
  trainingParticipants: (trainingId?: string) =>
    ["training-participants", trainingId] as const,
  centralWarehouses: ["central-warehouses"] as const,
  centralWarehouse: ["central-warehouse"] as const,
  inspections: ["inspections"] as const,
  epis: ["epis"] as const,
  epi: ["epi"] as const,
  epiMovements: ["epi-movements"] as const,
  epiDeliveries: ["epi-deliveries"] as const,
};

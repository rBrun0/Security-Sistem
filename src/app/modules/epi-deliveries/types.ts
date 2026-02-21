export type EPIDeliveryStatus = "pendente" | "assinado";

export type EPIDeliveryItem = {
  epiId: string;
  epiName: string;
  ca?: string;
  quantity: number;
  unitValue: number;
};

export type EPIDelivery = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCpf?: string;
  environmentId: string;
  environmentName: string;
  items: EPIDeliveryItem[];
  deliveryDate: string;
  deliveryResponsible: string;
  signatureToken: string;
  status: EPIDeliveryStatus;
  createdAt?: Date;
};

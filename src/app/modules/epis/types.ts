export type EPICategory =
  | "cabeca"
  | "olhos_face"
  | "auditivo"
  | "respiratorio"
  | "tronco"
  | "membros_superiores"
  | "membros_inferiores"
  | "corpo_inteiro"
  | "queda";

export type EPI = {
  id: string;
  name: string;
  description?: string;
  ca?: string;
  caValidity?: string;
  category?: EPICategory;
  centralWarehouseId?: string;
  centralWarehouseName?: string;
  quantity: number;
  unitValue: number;
  createdAt?: Date;
  updatedAt?: Date;
};

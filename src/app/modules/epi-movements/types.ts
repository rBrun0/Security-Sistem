export type EPIMovementType = "entrada" | "saida" | "transferencia";

export type EPIMovement = {
  id: string;
  type: EPIMovementType;
  epiId: string;
  epiName: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  originWarehouseId?: string;
  originWarehouseName?: string;
  destinationWarehouseId?: string;
  destinationWarehouseName?: string;
  destinationEnvironmentId?: string;
  destinationEnvironmentName?: string;
  movementDate?: string;
  observation?: string;
  createdAt?: Date;
};

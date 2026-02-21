export type CentralWarehouse = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  responsible?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

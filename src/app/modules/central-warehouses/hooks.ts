import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCentralWarehouse,
  deleteCentralWarehouse,
  getCentralWarehouseById,
  getCentralWarehouses,
  updateCentralWarehouse,
} from "./service";
import { CentralWarehouse } from "./types";

export function useCentralWarehouses() {
  return useQuery({
    queryKey: ["central-warehouses"],
    queryFn: getCentralWarehouses,
  });
}

export function useCentralWarehouse(id?: string) {
  return useQuery({
    queryKey: ["central-warehouse", id],
    queryFn: () => getCentralWarehouseById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCentralWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CentralWarehouse, "id">) =>
      createCentralWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["central-warehouses"] });
    },
  });
}

export function useUpdateCentralWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CentralWarehouse>;
    }) => updateCentralWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["central-warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["central-warehouse"] });
    },
  });
}

export function useDeleteCentralWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCentralWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["central-warehouses"] });
    },
  });
}

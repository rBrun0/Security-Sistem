import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCentralWarehouse,
  deleteCentralWarehouse,
  getCentralWarehouseById,
  getCentralWarehouses,
  updateCentralWarehouse,
} from "./service";
import { CentralWarehouse } from "./types";
import { queryKeys } from "../shared/query-keys";

export function useCentralWarehouses() {
  return useQuery({
    queryKey: queryKeys.centralWarehouses,
    queryFn: getCentralWarehouses,
  });
}

export function useCentralWarehouse(id?: string) {
  return useQuery({
    queryKey: [...queryKeys.centralWarehouse, id],
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
      queryClient.invalidateQueries({ queryKey: queryKeys.centralWarehouses });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.centralWarehouses });
      queryClient.invalidateQueries({ queryKey: queryKeys.centralWarehouse });
    },
  });
}

export function useDeleteCentralWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCentralWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.centralWarehouses });
    },
  });
}

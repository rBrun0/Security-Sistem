import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEPIDelivery, getEPIDeliveries } from "./service";
import { EPIDelivery } from "./types";
import { queryKeys } from "../shared/query-keys";

export function useEPIDeliveries() {
  return useQuery({
    queryKey: queryKeys.epiDeliveries,
    queryFn: getEPIDeliveries,
  });
}

export function useCreateEPIDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<EPIDelivery, "id">) => createEPIDelivery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.epiDeliveries });
    },
  });
}

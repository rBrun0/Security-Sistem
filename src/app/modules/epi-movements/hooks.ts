import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyEPIMovement,
  createEPIMovement,
  getEPIMovements,
} from "./service";
import { EPIMovement } from "./types";
import { queryKeys } from "../shared/query-keys";

export function useEPIMovements() {
  return useQuery({
    queryKey: queryKeys.epiMovements,
    queryFn: getEPIMovements,
  });
}

export function useCreateEPIMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<EPIMovement, "id">) => createEPIMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.epiMovements });
    },
  });
}

export function useApplyEPIMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<EPIMovement, "id">) => applyEPIMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.epiMovements });
      queryClient.invalidateQueries({ queryKey: queryKeys.epis });
      queryClient.invalidateQueries({ queryKey: queryKeys.epi });
    },
  });
}

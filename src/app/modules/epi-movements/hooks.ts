import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEPIMovement, getEPIMovements } from "./service";
import { EPIMovement } from "./types";

export function useEPIMovements() {
  return useQuery({
    queryKey: ["epi-movements"],
    queryFn: getEPIMovements,
  });
}

export function useCreateEPIMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<EPIMovement, "id">) => createEPIMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["epi-movements"] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEPI,
  deleteEPI,
  getEPIById,
  getEPIs,
  updateEPI,
} from "./service";
import { EPI } from "./types";
import { queryKeys } from "../shared/query-keys";

export function useEPIs() {
  return useQuery({
    queryKey: queryKeys.epis,
    queryFn: getEPIs,
  });
}

export function useEPI(id?: string) {
  return useQuery({
    queryKey: [...queryKeys.epi, id],
    queryFn: () => getEPIById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateEPI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<EPI, "id">) => createEPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.epis });
    },
  });
}

export function useUpdateEPI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EPI> }) =>
      updateEPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.epis });
      queryClient.invalidateQueries({ queryKey: queryKeys.epi });
    },
  });
}

export function useDeleteEPI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.epis });
    },
  });
}

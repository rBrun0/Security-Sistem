import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTechnicalResponsible,
  deleteTechnicalResponsible,
  getTechnicalResponsibles,
  updateTechnicalResponsible,
} from "./service";
import { Instructor } from "../instructors/types";
import { queryKeys } from "../shared/query-keys";

export function useTechnicalResponsibles() {
  return useQuery({
    queryKey: queryKeys.technicalResponsibles,
    queryFn: getTechnicalResponsibles,
  });
}

export function useCreateTechnicalResponsible() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Instructor, "id">) =>
      createTechnicalResponsible(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.technicalResponsibles,
      }),
  });
}

export function useUpdateTechnicalResponsible() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Instructor> }) =>
      updateTechnicalResponsible(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.technicalResponsibles,
      }),
  });
}

export function useDeleteTechnicalResponsible() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTechnicalResponsible(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.technicalResponsibles,
      }),
  });
}

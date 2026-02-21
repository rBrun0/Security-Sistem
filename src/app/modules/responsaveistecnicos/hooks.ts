import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTechnicalResponsible,
  deleteTechnicalResponsible,
  getTechnicalResponsibles,
  updateTechnicalResponsible,
} from "./service";
import { Instructor } from "../instructors/types";

export function useTechnicalResponsibles() {
  return useQuery({
    queryKey: ["technical_responsibles"],
    queryFn: getTechnicalResponsibles,
  });
}

export function useCreateTechnicalResponsible() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Instructor, "id">) =>
      createTechnicalResponsible(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["technical_responsibles"] }),
  });
}

export function useUpdateTechnicalResponsible() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Instructor> }) =>
      updateTechnicalResponsible(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["technical_responsibles"] }),
  });
}

export function useDeleteTechnicalResponsible() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTechnicalResponsible(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["technical_responsibles"] }),
  });
}

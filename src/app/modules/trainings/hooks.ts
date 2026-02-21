import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTraining,
  getTrainingById,
  getTrainings,
  updateTraining,
} from "./service";
import { Training } from "./types";

export function useTrainings() {
  return useQuery({
    queryKey: ["trainings"],
    queryFn: getTrainings,
  });
}

export function useTraining(id?: string) {
  return useQuery({
    queryKey: ["training", id],
    queryFn: () => getTrainingById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Training, "id">) => createTraining(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trainings"] }),
  });
}

export function useUpdateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Training> }) =>
      updateTraining(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      queryClient.invalidateQueries({ queryKey: ["training"] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTrainingModel,
  deleteTrainingModel,
  getTrainingModels,
  updateTrainingModel,
} from "./service";
import { TrainingModel } from "./types";

export function useTrainingModels() {
  return useQuery({
    queryKey: ["training-models"],
    queryFn: getTrainingModels,
  });
}

export function useCreateTrainingModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<TrainingModel, "id">) => createTrainingModel(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["training-models"] }),
  });
}

export function useUpdateTrainingModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TrainingModel> }) =>
      updateTrainingModel(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["training-models"] }),
  });
}

export function useDeleteTrainingModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTrainingModel(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["training-models"] }),
  });
}

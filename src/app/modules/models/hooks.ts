import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTrainingModel,
  deleteTrainingModel,
  getTrainingModels,
  updateTrainingModel,
} from "./service";
import { TrainingModel } from "./types";
import { queryKeys } from "../shared/query-keys";

export function useTrainingModels() {
  return useQuery({
    queryKey: queryKeys.trainingModels,
    queryFn: getTrainingModels,
  });
}

export function useCreateTrainingModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<TrainingModel, "id">) => createTrainingModel(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingModels }),
  });
}

export function useUpdateTrainingModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TrainingModel> }) =>
      updateTrainingModel(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingModels }),
  });
}

export function useDeleteTrainingModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTrainingModel(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingModels }),
  });
}

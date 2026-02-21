import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTrainingParticipant,
  createTrainingParticipants,
  deleteTrainingParticipant,
  getTrainingParticipants,
} from "./service";
import { TrainingParticipant } from "./types";

export function useTrainingParticipants(trainingId?: string) {
  return useQuery({
    queryKey: ["training-participants", trainingId],
    queryFn: () => getTrainingParticipants(trainingId as string),
    enabled: Boolean(trainingId),
  });
}

export function useCreateTrainingParticipant(trainingId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<TrainingParticipant, "id">) =>
      createTrainingParticipant(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["training-participants", trainingId],
      }),
  });
}

export function useCreateTrainingParticipants(trainingId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<TrainingParticipant, "id">[]) =>
      createTrainingParticipants(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["training-participants", trainingId],
      }),
  });
}

export function useDeleteTrainingParticipant(trainingId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTrainingParticipant(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["training-participants", trainingId],
      }),
  });
}

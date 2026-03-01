import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInstructor, deleteInstructor, getInstructors } from "./service";
import { queryKeys } from "../shared/query-keys";

export function useInstructors() {
  return useQuery({ queryKey: queryKeys.instructors, queryFn: getInstructors });
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInstructor,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.instructors }),
  });
}

export function useDeleteInstrutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInstructor,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.instructors }),
  });
}

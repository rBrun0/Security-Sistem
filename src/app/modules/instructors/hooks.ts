import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInstructor, deleteInstructor, getInstructors } from "./service";

export function useInstructors() {
  return useQuery({ queryKey: ["instructors"], queryFn: getInstructors });
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInstructor,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["instructors"] }),
  });
}

export function useDeleteInstrutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInstructor,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["instructors"] }),
  });
}

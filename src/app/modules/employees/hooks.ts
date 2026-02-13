import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEmployee, getEmployees } from "./service";

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

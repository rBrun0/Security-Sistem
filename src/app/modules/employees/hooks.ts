import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEmployee, CreateEmployeeInput, getEmployees } from "./service";
import { queryKeys } from "../shared/query-keys";

export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees,
    queryFn: getEmployees,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeInput) => createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
}

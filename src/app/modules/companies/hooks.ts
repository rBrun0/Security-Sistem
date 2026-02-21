import { useQuery } from "@tanstack/react-query";
import { getActiveCompanies } from "./service";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: getActiveCompanies,
  });
}

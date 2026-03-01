import { useQuery } from "@tanstack/react-query";
import { getActiveCompanies } from "./service";
import { queryKeys } from "../shared/query-keys";

export function useCompanies() {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: getActiveCompanies,
  });
}

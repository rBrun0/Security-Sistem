import { useQuery } from "@tanstack/react-query";
import { getInspections } from "./service";
import { queryKeys } from "../shared/query-keys";

export function useInspections() {
  return useQuery({
    queryKey: queryKeys.inspections,
    queryFn: getInspections,
  });
}

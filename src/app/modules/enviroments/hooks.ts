import { useQuery } from "@tanstack/react-query";
import { getActiveEnvironments } from "./service";
import { queryKeys } from "../shared/query-keys";

export function useEnvironments() {
  return useQuery({
    queryKey: queryKeys.environments,
    queryFn: getActiveEnvironments,
  });
}

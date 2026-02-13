import { useQuery } from "@tanstack/react-query";
import { getActiveEnvironments } from "./service";

export function useEnvironments() {
  return useQuery({
    queryKey: ["environments"],
    queryFn: getActiveEnvironments,
  });
}

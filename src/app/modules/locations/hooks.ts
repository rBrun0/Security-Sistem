import { useQuery } from "@tanstack/react-query";
import { getCitiesByState, getStates } from "./service";

export function useBrazilStates() {
  return useQuery({
    queryKey: ["locations", "states"],
    queryFn: getStates,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useStateCities(uf?: string) {
  return useQuery({
    queryKey: ["locations", "states", uf, "cities"],
    queryFn: () => getCitiesByState(uf as string),
    enabled: Boolean(uf),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

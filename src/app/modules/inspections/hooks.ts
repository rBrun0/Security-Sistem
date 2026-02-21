import { useQuery } from "@tanstack/react-query";
import { getInspections } from "./service";

export function useInspections() {
  return useQuery({
    queryKey: ["inspections"],
    queryFn: getInspections,
  });
}

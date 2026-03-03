"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import {
  clearInspectionDraftIdFromStorage,
  isInspectionCreatePath,
} from "./modules/inspections/draft-storage";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();

  useEffect(() => {
    if (!isInspectionCreatePath(pathname)) {
      clearInspectionDraftIdFromStorage();
    }
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

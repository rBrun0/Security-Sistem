"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TurmaDetalhesLegacyRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");

    if (id) {
      router.replace(`/treinamento/turmas/${id}`);
      return;
    }

    router.replace("/treinamento/turmas");
  }, [router, searchParams]);

  return null;
}

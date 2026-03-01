"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TurmaDetalhesLegacyRedirectContent() {
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

export default function TurmaDetalhesLegacyRedirectPage() {
  return (
    <Suspense fallback={null}>
      <TurmaDetalhesLegacyRedirectContent />
    </Suspense>
  );
}

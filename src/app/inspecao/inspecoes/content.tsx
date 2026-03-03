"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createPageUrl } from "@/lib/utils";
import { Inspecoes } from "./inspecoes";
import { PageHeader } from "@/src/components/common";

export const Content = () => {
  return (
    <>
      <PageHeader
        title="Inspeções"
        description="Gerencie as inspeções de segurança"
        actions={
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href={createPageUrl("inspecao/inspecoes/nova")}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Inspeção
            </Link>
          </Button>
        }
      />
      <Inspecoes />
    </>
  );
};

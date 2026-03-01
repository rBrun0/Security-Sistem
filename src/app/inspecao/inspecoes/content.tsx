"use client";

import { useState } from "react";
import { Inspection } from "../../modules/inspections/types";
import { FormDialog } from "./formDialog";
import { Inspecoes } from "./inspecoes";
import { PageHeader } from "@/src/components/common";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(
    null,
  );

  return (
    <>
      <PageHeader
        title="Inspeções"
        description="Gerencie as inspeções de segurança"
        actions={
          <FormDialog
            key={editingInspection?.id ?? "new"}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            editingInspection={editingInspection}
            setEditingInspection={setEditingInspection}
          />
        }
      />
      <Inspecoes
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setEditingInspection={setEditingInspection}
      />
    </>
  );
};

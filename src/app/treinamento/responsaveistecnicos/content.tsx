"use client";

import { useState } from "react";
import { FormDialog } from "./formDialog";
import { ResponsaveisTecnicos } from "./responsaveistecnicos";
import { Instructor } from "../../modules/instructors/types";
import { PageHeader } from "@/src/components/common";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTechnicalResponsible, setEditingTechnicalResponsible] =
    useState<Instructor | null>(null);

  return (
    <>
      <PageHeader
        title="Responsáveis Técnicos"
        description="Gerencie os responsáveis técnicos dos treinamentos"
        actions={
          <FormDialog
            key={editingTechnicalResponsible?.id ?? "new"}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            editingTechnicalResponsible={editingTechnicalResponsible}
            setEditingTechnicalResponsible={setEditingTechnicalResponsible}
          />
        }
      />

      <ResponsaveisTecnicos
        setIsOpen={setIsOpen}
        setEditingTechnicalResponsible={setEditingTechnicalResponsible}
      />
    </>
  );
};

"use client";

import { useState } from "react";
import { FormDialog } from "./formDialog";
import { ResponsaveisTecnicos } from "./responsaveistecnicos";
import { Instructor } from "../../modules/instructors/types";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTechnicalResponsible, setEditingTechnicalResponsible] =
    useState<Instructor | null>(null);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Responsáveis Técnicos
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os responsáveis técnicos dos treinamentos
          </p>
        </div>
        <FormDialog
          key={editingTechnicalResponsible?.id ?? "new"}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          editingTechnicalResponsible={editingTechnicalResponsible}
          setEditingTechnicalResponsible={setEditingTechnicalResponsible}
        />
      </div>

      <ResponsaveisTecnicos
        setIsOpen={setIsOpen}
        setEditingTechnicalResponsible={setEditingTechnicalResponsible}
      />
    </>
  );
};

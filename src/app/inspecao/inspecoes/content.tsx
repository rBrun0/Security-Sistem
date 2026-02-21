"use client";

import { useState } from "react";
import { Inspection } from "../../modules/inspections/types";
import { FormDialog } from "./formDialog";
import { Inspecoes } from "./inspecoes";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(
    null,
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Inspeções</h1>
          <p className="text-slate-500 mt-1">
            Gerencie as inspeções de segurança
          </p>
        </div>
        <FormDialog
          key={editingInspection?.id ?? "new"}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          editingInspection={editingInspection}
          setEditingInspection={setEditingInspection}
        />
      </div>
      <Inspecoes
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setEditingInspection={setEditingInspection}
      />
    </>
  );
};

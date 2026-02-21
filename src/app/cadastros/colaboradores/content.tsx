"use client";

import { useState } from "react";
import { Employee } from "../../modules/employees/types";
import { FormDialog } from "./formDialog";
import { Colaboradores } from "./colaboradores";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Employee | null>(
    null,
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Colaboradores</h1>
          <p className="text-slate-500 mt-1">
            Gerencie os colaboradores da empresa
          </p>
        </div>
        <FormDialog
          key={editingColaborador?.id ?? "new"}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          editingColaborador={editingColaborador}
          setEditingColaborador={setEditingColaborador}
        />
      </div>
      <Colaboradores
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setEditingColaborador={setEditingColaborador}
      />
    </>
  );
};

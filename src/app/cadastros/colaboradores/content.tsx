"use client";

import { useState } from "react";
import { Employee } from "../../modules/employees/types";
import { FormDialog } from "./formDialog";
import { Colaboradores } from "./colaboradores";
import { PageHeader } from "@/src/components/common";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Employee | null>(
    null,
  );

  return (
    <>
      <PageHeader
        title="Colaboradores"
        description="Gerencie os colaboradores da empresa"
        actions={
          <FormDialog
            key={editingColaborador?.id ?? "new"}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            editingColaborador={editingColaborador}
            setEditingColaborador={setEditingColaborador}
          />
        }
      />
      <Colaboradores
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setEditingColaborador={setEditingColaborador}
      />
    </>
  );
};

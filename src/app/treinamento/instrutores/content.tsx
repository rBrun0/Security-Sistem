"use client";

import { useState } from "react";
import { Instructors } from "./instructors";
import { FormDialog } from "./formDialog";
import { Instrutor } from "../../modules/instructors/types";
import { PageHeader } from "@/src/components/common";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instrutor | null>(
    null,
  );

  return (
    <>
      <PageHeader
        title="Instrutores"
        description="Gerenciar instrutores de treinamento"
        actions={
          <FormDialog
            key={editingInstructor?.id ?? "new"}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            editingInstructor={editingInstructor}
            setEditingInstructor={setEditingInstructor}
          />
        }
      />
      <Instructors
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setEditingInstructor={setEditingInstructor}
      />
    </>
  );
};

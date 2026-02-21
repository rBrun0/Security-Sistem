"use client";

import { useState } from "react";
import { Instructors } from "./instructors";
import { FormDialog } from "./formDialog";
import { Instrutor } from "../../modules/instructors/types";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instrutor | null>(
    null,
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Instrutores</h1>
          <p className="text-slate-500 mt-1">
            Gerenciar instrutores de treinamento
          </p>
        </div>
        <FormDialog
          key={editingInstructor?.id ?? "new"}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          editingInstructor={editingInstructor}
          setEditingInstructor={setEditingInstructor}
        />
      </div>
      <Instructors
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setEditingInstructor={setEditingInstructor}
      />
    </>
  );
};

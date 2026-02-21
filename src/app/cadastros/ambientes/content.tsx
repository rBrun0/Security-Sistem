"use client";

import { useState } from "react";
import { Envoriments } from "./enviroments";
import { FormDialog } from "./formDialog";
import { Environment } from "../../modules/enviroments/types";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEnvironment, setEditingEnvironment] =
    useState<Environment | null>(null);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Ambientes (Obras)
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os ambientes de trabalho
          </p>
        </div>
        <FormDialog
          key={editingEnvironment?.id ?? "new"}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          editingEnvironment={editingEnvironment}
          setEditingEnviroment={setEditingEnvironment}
        />
      </div>
      <Envoriments
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setEditingEnvironment={setEditingEnvironment}
      />
    </>
  );
};

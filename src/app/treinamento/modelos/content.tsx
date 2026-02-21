"use client";

import { useState } from "react";
import { Modelos } from "./modelos";
import { FormDialog } from "./formDialog";
import { TrainingModel } from "../../modules/models/types";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<TrainingModel | null>(null);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Modelos de Treinamento
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os modelos de treinamento
          </p>
        </div>
        <FormDialog
          key={editingModel?.id ?? "new"}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          editingModel={editingModel}
          setEditingModel={setEditingModel}
        />
      </div>
      <Modelos setIsOpen={setIsOpen} setEditingModel={setEditingModel} />
    </>
  );
};

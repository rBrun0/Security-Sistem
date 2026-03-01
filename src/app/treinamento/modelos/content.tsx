"use client";

import { useState } from "react";
import { Modelos } from "./modelos";
import { FormDialog } from "./formDialog";
import { TrainingModel } from "../../modules/models/types";
import { PageHeader } from "@/src/components/common";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<TrainingModel | null>(null);

  return (
    <>
      <PageHeader
        title="Modelos de Treinamento"
        description="Gerencie os modelos de treinamento"
        actions={
          <FormDialog
            key={editingModel?.id ?? "new"}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            editingModel={editingModel}
            setEditingModel={setEditingModel}
          />
        }
      />
      <Modelos setIsOpen={setIsOpen} setEditingModel={setEditingModel} />
    </>
  );
};

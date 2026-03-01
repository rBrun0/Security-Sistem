"use client";

import { useState } from "react";
import { Envoriments } from "./enviroments";
import { FormDialog } from "./formDialog";
import { Environment } from "../../modules/enviroments/types";
import { PageHeader } from "@/src/components/common";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEnvironment, setEditingEnvironment] =
    useState<Environment | null>(null);

  return (
    <>
      <PageHeader
        title="Ambientes"
        description="Gerencie os ambientes de trabalho"
        actions={
          <FormDialog
            key={editingEnvironment?.id ?? "new"}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            editingEnvironment={editingEnvironment}
            setEditingEnviroment={setEditingEnvironment}
          />
        }
      />

      <Envoriments
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setEditingEnvironment={setEditingEnvironment}
      />
    </>
  );
};

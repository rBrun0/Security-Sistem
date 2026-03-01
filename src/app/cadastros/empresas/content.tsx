"use client";

import { useState } from "react";
import { Companies } from "./companies";
import { FormDialog } from "./formDialog";
import { Company } from "../../modules/companies/types";
import { PageHeader } from "@/src/components/common";

export const Content = () => {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Empresas"
        description="Gerencie as empresas cadastradas"
        actions={
          <FormDialog
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            editingCompany={editingCompany}
            setEditingCompany={setEditingCompany}
          />
        }
      />

      <Companies
        setEditingCompany={setEditingCompany}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

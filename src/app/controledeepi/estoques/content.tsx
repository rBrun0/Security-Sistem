"use client";

import { useState } from "react";
import { CentralWarehouse } from "@/src/app/modules/central-warehouses/types";
import { FormDialog } from "./formDialog";
import { Warehouses } from "./warehouses";
import { PageHeader } from "@/src/components/common";

export default function Content() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] =
    useState<CentralWarehouse | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoques Centrais"
        description="Gerencie os locais de estoque de EPIs"
        actions={
          <FormDialog
            key={editingWarehouse?.id ?? "new"}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            editingWarehouse={editingWarehouse}
            setEditingWarehouse={setEditingWarehouse}
          />
        }
      />

      <Warehouses
        setIsOpen={setIsOpen}
        setEditingWarehouse={setEditingWarehouse}
      />
    </div>
  );
}

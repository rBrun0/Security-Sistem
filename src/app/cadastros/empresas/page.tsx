"use client";

import { useState } from "react";
import { Companies } from "./companies";
import { FormDialog } from "./formDialog";
import { Company } from "../../modules/companies/types";

export default function Page() {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Empresas</h1>
          <p className="text-slate-500 mt-1">
            Gerencie as empresas cadastradas
          </p>
        </div>

        <div>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            onClick={() => setIsOpen(true)}
          >
            <span className="mr-2">+</span> Nova Empresa
          </button>
        </div>
      </div>

      <FormDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        editingCompany={editingCompany}
        setEditingCompany={setEditingCompany}
      />

      <Companies
        setEditingCompany={setEditingCompany}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </div>
  );
}

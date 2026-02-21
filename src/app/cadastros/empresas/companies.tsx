"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCompanies } from "../../modules/companies/hooks";
import { Company } from "../../modules/companies/types";
import { updateCompany } from "../../modules/companies/service";
import { CompanyCard } from "@/components/domains/card-company";

export const Companies = ({
  setEditingCompany,
  isOpen,
  setIsOpen,
}: {
  setEditingCompany: Dispatch<SetStateAction<Company | null>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useCompanies();

  const filtered = companies.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome ou documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      <div className="mb-4" />

      {isLoading ? (
        <div>Carregando...</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-slate-500 text-center">
              Nenhuma empresa encontrada
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              statusColors={{
                active: "bg-emerald-100 text-emerald-700",
                inactive: "bg-slate-100 text-slate-700",
                deleted: "bg-rose-100 text-rose-700",
              }}
              onEdit={(c) => {
                setEditingCompany(c);
                setIsOpen(true);
              }}
              onDelete={async (c) => {
                try {
                  await updateCompany(c.id, { status: "deleted" });
                  await queryClient.invalidateQueries({
                    queryKey: ["companies"],
                  });
                  toast.success("Empresa removida (soft delete)");
                } catch (err) {
                  toast.error("Erro ao remover empresa");
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

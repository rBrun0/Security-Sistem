"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "@/components/ui/input";
import { UserCheck, Search, Plus } from "lucide-react";
import {
  useDeleteTechnicalResponsible,
  useTechnicalResponsibles,
} from "../../modules/responsaveistecnicos/hooks";
import { Instructor } from "../../modules/instructors/types";
import { TechnicalResponsibleCard } from "@/components/domains/card-technical-responsible";
import { EmptyStateCard, LoadingCardGrid } from "@/src/components/common";

export const ResponsaveisTecnicos = ({
  setEditingTechnicalResponsible,
  setIsOpen,
}: {
  setEditingTechnicalResponsible: Dispatch<SetStateAction<Instructor | null>>;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: technicalResponsibles = [], isLoading } =
    useTechnicalResponsibles();
  const deleteMutation = useDeleteTechnicalResponsible();

  const filtered = technicalResponsibles.filter((technicalResponsible) =>
    (technicalResponsible.name ?? "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {isLoading ? (
        <LoadingCardGrid lineWidths={["w-3/4", "w-1/2"]} />
      ) : filtered.length === 0 ? (
        <EmptyStateCard
          icon={UserCheck}
          message={
            searchTerm
              ? "Nenhum responsável encontrado"
              : "Nenhum responsável técnico cadastrado"
          }
          actionLabel={
            !searchTerm ? "Cadastrar primeiro responsável" : undefined
          }
          actionIcon={!searchTerm ? Plus : undefined}
          onAction={!searchTerm ? () => setIsOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((technicalResponsible) => (
            <TechnicalResponsibleCard
              key={technicalResponsible.id}
              technicalResponsible={technicalResponsible}
              onEdit={(technicalResponsibleToEdit) => {
                setEditingTechnicalResponsible(technicalResponsibleToEdit);
                setIsOpen(true);
              }}
              onDelete={async (technicalResponsibleToDelete) => {
                if (!technicalResponsibleToDelete.id) return;
                await deleteMutation.mutateAsync(
                  technicalResponsibleToDelete.id,
                );
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

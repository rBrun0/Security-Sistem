"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck, Search, Plus } from "lucide-react";
import {
  useDeleteTechnicalResponsible,
  useTechnicalResponsibles,
} from "../../modules/responsaveistecnicos/hooks";
import { Instructor } from "../../modules/instructors/types";
import { TechnicalResponsibleCard } from "@/components/domains/card-technical-responsible";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCheck className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhum responsável encontrado"
                : "Nenhum responsável técnico cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar primeiro responsável
              </Button>
            )}
          </CardContent>
        </Card>
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

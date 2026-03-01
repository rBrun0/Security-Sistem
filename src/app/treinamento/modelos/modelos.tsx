"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search } from "lucide-react";
import {
  useDeleteTrainingModel,
  useTrainingModels,
} from "../../modules/models/hooks";
import { TrainingModel } from "../../modules/models/types";
import { TrainingModelCard } from "@/components/domains/card-training-model";
import { EmptyStateCard, LoadingCardGrid } from "@/src/components/common";

export const Modelos = ({
  setEditingModel,
  setIsOpen,
}: {
  setEditingModel: Dispatch<SetStateAction<TrainingModel | null>>;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: modelos = [], isLoading } = useTrainingModels();
  const deleteMutation = useDeleteTrainingModel();

  const handleEdit = (modelo: TrainingModel) => {
    setEditingModel(modelo);
    setIsOpen(true);
  };

  const filteredModelos = modelos.filter(
    (model) =>
      model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.standard?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const modalidadeColors: Record<string, string> = {
    presencial: "bg-blue-100 text-blue-700",
    ead: "bg-purple-100 text-purple-700",
    semipresencial: "bg-teal-100 text-teal-700",
  };

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome ou norma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {isLoading ? (
        <LoadingCardGrid lineWidths={["w-3/4", "w-1/2"]} />
      ) : filteredModelos.length === 0 ? (
        <EmptyStateCard
          icon={FileText}
          message={
            searchTerm ? "Nenhum modelo encontrado" : "Nenhum modelo cadastrado"
          }
          actionLabel={!searchTerm ? "Criar Primeiro Modelo" : undefined}
          actionIcon={!searchTerm ? Plus : undefined}
          onAction={!searchTerm ? () => setIsOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModelos.map((modelo) => (
            <TrainingModelCard
              key={modelo.id}
              model={modelo}
              modalityColors={modalidadeColors}
              onEdit={handleEdit}
              onDelete={async (modelToDelete) => {
                if (!modelToDelete.id) return;
                await deleteMutation.mutateAsync(modelToDelete.id);
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search } from "lucide-react";
import {
  useDeleteTrainingModel,
  useTrainingModels,
} from "../../modules/models/hooks";
import { TrainingModel } from "../../modules/models/types";
import { TrainingModelCard } from "@/components/domains/card-training-model";

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
      ) : filteredModelos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhum modelo encontrado"
                : "Nenhum modelo cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Modelo
              </Button>
            )}
          </CardContent>
        </Card>
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

"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Plus, ClipboardCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useInspections } from "../../modules/inspections/hooks";
import { useEnvironments } from "../../modules/enviroments/hooks";
import { Inspection } from "../../modules/inspections/types";
import { deleteInspection } from "../../modules/inspections/service";
import { InspectionCard } from "@/components/domains/card-inspection";
import { EmptyStateCard, LoadingCardGrid } from "@/src/components/common";

export const Inspecoes = ({
  setEditingInspection,
  isOpen,
  setIsOpen,
}: {
  setEditingInspection: Dispatch<SetStateAction<Inspection | null>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  const queryClient = useQueryClient();

  const { data: inspections = [], isLoading } = useInspections();
  const { data: environments = [] } = useEnvironments();

  const filtered = inspections.filter((i) => {
    const matchActive = i.isActive !== false;
    const matchSearch =
      i.environment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.inspection_date?.includes(searchTerm);
    const matchStatus = filterStatus === "todos" || i.status === filterStatus;
    return matchActive && matchSearch && matchStatus;
  });

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por obra ou data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="approved">Aprovada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingCardGrid lineWidths={["w-3/4", "w-1/2"]} />
      ) : filtered.length === 0 ? (
        <EmptyStateCard
          icon={ClipboardCheck}
          message={
            searchTerm
              ? "Nenhuma inspeção encontrada"
              : "Nenhuma inspeção cadastrada"
          }
          actionLabel={!searchTerm ? "Cadastrar Primeira Inspeção" : undefined}
          actionIcon={!searchTerm ? Plus : undefined}
          onAction={!searchTerm ? () => setIsOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((inspection) => (
            <InspectionCard
              key={inspection.id}
              inspection={inspection}
              statusColors={statusColors}
              onEdit={(insp) => {
                setEditingInspection(insp);
                setIsOpen(true);
              }}
              onDelete={async (insp) => {
                try {
                  await deleteInspection(insp.id);
                  await queryClient.invalidateQueries({
                    queryKey: ["inspections"],
                  });
                  toast.success("Inspeção inativada");
                } catch (err) {
                  toast.error("Erro ao inativar inspeção");
                }
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

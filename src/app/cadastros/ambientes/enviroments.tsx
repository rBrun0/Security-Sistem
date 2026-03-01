"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Plus, Building2, Search } from "lucide-react";
import { updateEnvironment } from "../../modules/enviroments/service";
import { useEnvironments } from "../../modules/enviroments/hooks";
import { useEmployees } from "../../modules/employees/hooks";
import { Environment } from "../../modules/enviroments/types";
import { EnvironmentCard } from "@/components/domains/card-enviroment";
import { EmptyStateCard, LoadingCardGrid } from "@/src/components/common";

export const Envoriments = ({
  setEditingEnvironment,
  isOpen,
  setIsOpen,
}: {
  setEditingEnvironment: Dispatch<SetStateAction<Environment | null>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: enviroments = [], isLoading } = useEnvironments();

  const filteredEnviroments = enviroments.filter(
    (environment) =>
      environment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      environment.client?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const statusColors = {
    active: "bg-green-100 text-green-700",
    concluded: "bg-blue-100 text-blue-700",
    paused: "bg-amber-100 text-amber-700",
    deleted: "",
  };

  const { data: employees = [] } = useEmployees();

  const getEmployeesCount = (enviromentId: string) => {
    return employees.filter((c) => c.environment_id === enviromentId).length;
  };

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {isLoading ? (
        <LoadingCardGrid lineWidths={["w-3/4", "w-1/2", "w-2/3"]} />
      ) : filteredEnviroments.length === 0 ? (
        <EmptyStateCard
          icon={Building2}
          message={
            searchTerm
              ? "Nenhum ambiente encontrado"
              : "Nenhum ambiente cadastrado"
          }
          actionLabel={!searchTerm ? "Cadastrar Primeiro Ambiente" : undefined}
          actionIcon={!searchTerm ? Plus : undefined}
          onAction={!searchTerm ? () => setIsOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnviroments.map((environment) => (
            <EnvironmentCard
              key={environment.id}
              environment={environment}
              statusColors={statusColors}
              getEmployeesCount={getEmployeesCount}
              onEdit={(env) => {
                setEditingEnvironment(env);
                setIsOpen(true);
              }}
              onDelete={async (env) => {
                await updateEnvironment(env.id, {
                  status: "deleted",
                });

                await queryClient.invalidateQueries({
                  queryKey: ["environments"],
                });
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

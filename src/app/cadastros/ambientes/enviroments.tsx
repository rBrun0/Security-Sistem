"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Building2,
  MapPin,
  User,
  Calendar,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Phone,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  createEnvironment,
  deleteEnvironment,
  getActiveEnvironments,
  updateEnvironment,
} from "../../modules/enviroments/service";
import { useEnvironments } from "../../modules/enviroments/hooks";
import { getActiveEmployees } from "../../modules/employees/service";
import { useEmployees } from "../../modules/employees/hooks";
import { Environment } from "../../modules/enviroments/types";
import { AlertDialogBuilder } from "@/components/builders/AlertDialogBuilder";
import { EnvironmentCard } from "@/components/domains/card-enviroment";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEnviroments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhum ambiente encontrado"
                : "Nenhum ambiente cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Ambiente
              </Button>
            )}
          </CardContent>
        </Card>
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

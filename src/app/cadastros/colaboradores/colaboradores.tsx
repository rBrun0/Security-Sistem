"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useEmployees } from "../../modules/employees/hooks";
import { useEnvironments } from "../../modules/enviroments/hooks";
import { useCompanies } from "../../modules/companies/hooks";
import { Employee } from "../../modules/employees/types";
import { EmployeeCard } from "@/components/domains/card-employee";
import { deleteEmployee } from "../../modules/employees/service";

export const Colaboradores = ({
  setEditingColaborador,
  isOpen,
  setIsOpen,
}: {
  setEditingColaborador: Dispatch<SetStateAction<Employee | null>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAmbiente, setFilterAmbiente] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useEmployees();
  const { data: environments = [] } = useEnvironments();
  const { data: companies = [] } = useCompanies();

  const filteredEmployees = employees.filter((c) => {
    const matchSearch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf?.includes(searchTerm);
    const matchAmbiente =
      filterAmbiente === "todos" || c.environment_id === filterAmbiente;
    const matchStatus = filterStatus === "todos" || c.status === filterStatus;
    return matchSearch && matchAmbiente && matchStatus;
  });

  const statusColors = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-slate-100 text-slate-700",
    on_leave: "bg-amber-100 text-amber-700",
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={filterAmbiente} onValueChange={setFilterAmbiente}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Ambientes</SelectItem>
            {environments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="on_leave">Afastado</SelectItem>
          </SelectContent>
        </Select>
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
      ) : filteredEmployees.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhum colaborador encontrado"
                : "Nenhum colaborador cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Colaborador
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              statusColors={statusColors}
              onEdit={(emp) => {
                setEditingColaborador(emp);
                setIsOpen(true);
              }}
              onDelete={async (emp) => {
                if (confirm("Deseja remover este colaborador?")) {
                  try {
                    await deleteEmployee(emp.id);
                    await queryClient.invalidateQueries({
                      queryKey: ["employees"],
                    });
                    toast.success("Colaborador removido");
                  } catch (err) {
                    toast.error("Erro ao remover colaborador");
                  }
                }
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

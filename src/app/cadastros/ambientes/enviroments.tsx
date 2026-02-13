"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FormInput,
  FormPhoneInput,
  FormSelect,
  FormTextarea,
} from "@/src/components/form";
import { Form } from "@/components/ui/form";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import {
  createEnvironment,
  getActiveEnvironments,
  updateEnvironment,
} from "../../modules/enviroments/service";
import { useEnvironments } from "../../modules/enviroments/hooks";
import { getActiveEmployees } from "../../modules/employees/service";
import { useEmployees } from "../../modules/employees/hooks";

export const Envoriments = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: enviroments = [], isLoading } = useEnvironments();

  const filteredEnviroments = enviroments.filter(
    (enviroment) =>
      enviroment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enviroment.client?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const statusColors = {
    active: "bg-green-100 text-green-700",
    concluded: "bg-blue-100 text-blue-700",
    paused: "bg-amber-100 text-amber-700",
  };

  const { data: employees = [] } = useEmployees();

  const getEmployeesCount = async (enviromentId: string) => {
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
          {filteredEnviroments.map((enviroment) => (
            <Card
              key={enviroment.id}
              className="hover:shadow-lg transition-shadow border-0 shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {enviroment.name}
                      </CardTitle>
                      <Badge className={statusColors[enviroment.status]}>
                        {enviroment.status === "active"
                          ? "Ativo"
                          : enviroment.status === "concluded"
                            ? "Concluído"
                            : "Pausado"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        // onClick={() => handleEdit(ambiente)}
                        onClick={() =>
                          updateEnvironment(enviroment.id, enviroment)
                        }
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (confirm("Deseja excluir este ambiente?")) {
                            // deleteMutation.mutate(ambiente.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {enviroment.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      {enviroment.address}
                      {enviroment.city && `, ${enviroment.city}`}
                      {enviroment.state && ` - ${enviroment.state}`}
                    </span>
                  </div>
                )}
                {enviroment.client && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <User className="w-4 h-4" />
                    <span>{enviroment.client}</span>
                  </div>
                )}
                {enviroment.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="w-4 h-4" />
                    <span>{enviroment.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users className="w-4 h-4" />
                  <span>{getEmployeesCount(enviroment.id)} colaboradores</span>
                </div>
                {enviroment.start_date && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Início: {enviroment.start_date}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

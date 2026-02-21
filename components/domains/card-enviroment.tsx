"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Building2,
  MoreVertical,
  Edit,
  Trash2,
  MapPin,
  User,
  Phone,
  Users,
  Calendar,
} from "lucide-react";
import { AlertDialogBuilder } from "../builders/AlertDialogBuilder";
import { Environment } from "@/src/app/modules/enviroments/types";

interface EnvironmentCardProps {
  environment: Environment;
  statusColors: Record<string, string>;
  onEdit: (environment: Environment) => void;
  onDelete: (environment: Environment) => Promise<void> | void;
  getEmployeesCount: (environmentId: string) => number;
}

export function EnvironmentCard({
  environment,
  statusColors,
  onEdit,
  onDelete,
  getEmployeesCount,
}: EnvironmentCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          {" "}
          {/* Adicionado gap aqui */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>

            {/* Esta div é crucial ter min-w-0 */}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight block truncate">
                {/* Use 'truncate' para uma linha ou mantenha 'line-clamp-2' se quiser ate duas */}
                {environment.name}
              </CardTitle>

              <Badge className={`${statusColors[environment.status]} mt-1`}>
                {environment.status === "active"
                  ? "Ativo"
                  : environment.status === "concluded"
                    ? "Concluído"
                    : "Pausado"}
              </Badge>
            </div>
          </div>
          <div className="shrink-0 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(environment)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>

                <AlertDialogBuilder
                  title="Remover ambiente"
                  description={`Tem certeza que deseja remover o ambiente "${environment.name}"?`}
                  onConfirm={() => onDelete(environment)}
                >
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </DropdownMenuItem>
                </AlertDialogBuilder>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {environment.address && (
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="break-words">
              {environment.address}
              {environment.city && `, ${environment.city}`}
              {environment.state && ` - ${environment.state}`}
            </span>
          </div>
        )}

        {environment.client && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <User className="w-4 h-4 shrink-0" />
            <span className="break-words">{environment.client}</span>
          </div>
        )}

        {environment.phoneNumber && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone className="w-4 h-4 shrink-0" />
            <span>{environment.phoneNumber}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4 shrink-0" />
          <span>{getEmployeesCount(environment.id)} colaboradores</span>
        </div>

        {environment.start_date && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Início: {environment.start_date}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

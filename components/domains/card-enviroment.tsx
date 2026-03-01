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
import { formatPhoneForDisplay, plural } from "@/lib/utils";
import { Separator } from "../ui/separator";

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
  const employeesCount = getEmployeesCount(environment.id);

  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
      <CardHeader>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 pb-3">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <CardTitle className="text-lg leading-tight line-clamp-2 max-w-full">
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
          <div className="shrink-0">
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
                  title="Excluir ambiente"
                  description={`Tem certeza que deseja excluir o ambiente "${environment.name}"?`}
                  onConfirm={() => onDelete(environment)}
                  variant="destructive"
                >
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </AlertDialogBuilder>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator />
      </CardHeader>

      <CardContent className="pt-3 space-y-3">
        {environment.address && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="wrap-break-word">
              {environment.address}
              {environment.city && `, ${environment.city}`}
              {environment.state && ` - ${environment.state}`}{" "}
            </span>
          </div>
        )}

        {environment.client && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4 shrink-0" />
            <span className="wrap-break-word">{environment.client}</span>
          </div>
        )}

        {environment.phoneNumber && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 shrink-0" />
            <span>{formatPhoneForDisplay(environment.phoneNumber)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="w-4 h-4 shrink-0" />
          <span>
            {employeesCount}{" "}
            {plural(employeesCount, "colaborador", "colaboradores")}
          </span>
        </div>

        {environment.start_date && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Início: {environment.start_date}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

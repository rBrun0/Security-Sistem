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
  User,
  MoreVertical,
  Edit,
  Trash2,
  Building2,
  Phone,
  Briefcase,
} from "lucide-react";
import { AlertDialogBuilder } from "../builders/AlertDialogBuilder";
import { Employee } from "@/src/app/modules/employees/types";

interface EmployeeCardProps {
  employee: Employee;
  statusColors: Record<string, string>;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => Promise<void> | void;
}

export function EmployeeCard({
  employee,
  statusColors,
  onEdit,
  onDelete,
}: EmployeeCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-purple-600" />
            </div>

            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight block truncate">
                {employee.name}
              </CardTitle>

              <Badge className={`${statusColors[employee.status]} mt-1`}>
                {employee.status === "active"
                  ? "Ativo"
                  : employee.status === "inactive"
                    ? "Inativo"
                    : "Afastado"}
              </Badge>
            </div>
          </div>

          <div className="shrink-0 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              {/* <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => onEdit(employee)}>
                  <Edit className="mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDelete(employee)}>
                  <Trash2 className="mr-2" /> Remover
                </DropdownMenuItem>
              </DropdownMenuContent> */}
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(employee)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>

                <AlertDialogBuilder
                  title="Remover ambiente"
                  description={`Tem certeza que deseja remover o ambiente "${employee.name}"?`}
                  onConfirm={() => onDelete(employee)}
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
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-medium">CPF:</span> {employee.cpf}
        </div>

        {employee.job_title && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>{employee.job_title}</span>
          </div>
        )}

        {employee.role && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-xs">Função:</span> {employee.role}
          </div>
        )}

        {employee.company && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="break-words">{employee.company}</span>
          </div>
        )}

        {employee.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone className="w-4 h-4 shrink-0" />
            <span>{employee.phone}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

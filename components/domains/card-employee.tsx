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
import { cn, formatCPFForDisplay, formatPhoneForDisplay } from "@/lib/utils";
import { Separator } from "../ui/separator";

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
      <CardHeader>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 pb-3">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div
              className={cn(
                `w-10 h-10 rounded-lg flex items-center justify-center shrink-0`,
                statusColors[employee.status],
              )}
            >
              <User className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <CardTitle className="text-lg leading-tight truncate max-w-full">
                {employee.name}
              </CardTitle>

              <div className="flex items-center gap-3">
                <Badge className={`${statusColors[employee.status]} mt-1`}>
                  {employee.role}
                </Badge>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(employee)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>

                <AlertDialogBuilder
                  title="Excluir colaborador"
                  description={`Tem certeza que deseja excluir o colaborador "${employee.name}"?`}
                  onConfirm={() => onDelete(employee)}
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

      <CardContent className="pt-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">CPF:</span>{" "}
          {formatCPFForDisplay(employee.cpf)}
        </div>

        {employee.job_title && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>{employee.job_title}</span>
          </div>
        )}

        {employee.company && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="wrap-break-word">{employee.company}</span>
          </div>
        )}

        {employee.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 shrink-0" />
            <span>{formatPhoneForDisplay(employee.phone)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

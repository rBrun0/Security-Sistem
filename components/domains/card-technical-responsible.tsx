"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  UserCheck,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import { AlertDialogBuilder } from "../builders/AlertDialogBuilder";
import {
  Instructor,
  ProfessionalRegistration,
} from "@/src/app/modules/instructors/types";

interface TechnicalResponsibleCardProps {
  technicalResponsible: Instructor;
  onEdit: (technicalResponsible: Instructor) => void;
  onDelete: (technicalResponsible: Instructor) => Promise<void> | void;
}

export function TechnicalResponsibleCard({
  technicalResponsible,
  onEdit,
  onDelete,
}: TechnicalResponsibleCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-indigo-600" />
            </div>

            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight block truncate">
                {technicalResponsible.name}
              </CardTitle>

              {technicalResponsible.cpf && (
                <span className="text-sm text-slate-500">
                  CPF: {technicalResponsible.cpf}
                </span>
              )}
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
                <DropdownMenuItem onClick={() => onEdit(technicalResponsible)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>

                <AlertDialogBuilder
                  title="Excluir Responsável Técnico"
                  description="Esta ação não pode ser desfeita. Deseja continuar?"
                  confirmText="Excluir"
                  variant="destructive"
                  onConfirm={() => onDelete(technicalResponsible)}
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
      </CardHeader>

      <CardContent className="space-y-2">
        {technicalResponsible.email && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Mail className="w-4 h-4" />
            <span className="wrap-break-word">
              {technicalResponsible.email}
            </span>
          </div>
        )}

        {technicalResponsible.phoneNumber && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone className="w-4 h-4" />
            <span>{technicalResponsible.phoneNumber}</span>
          </div>
        )}

        {technicalResponsible.professionalRegistrations &&
          technicalResponsible.professionalRegistrations.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {technicalResponsible.professionalRegistrations
                .filter((registration: ProfessionalRegistration) =>
                  Boolean(registration.type),
                )
                .map(
                  (registration: ProfessionalRegistration, index: number) => (
                    <span
                      key={index}
                      className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full"
                    >
                      {registration.type}
                      {registration.number ? `: ${registration.number}` : ""}
                    </span>
                  ),
                )}
            </div>
          )}
      </CardContent>
    </Card>
  );
}

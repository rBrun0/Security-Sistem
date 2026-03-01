"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { User, MoreVertical, Edit, Trash2, Mail, Phone } from "lucide-react";
import { AlertDialogBuilder } from "../builders/AlertDialogBuilder";
import {
  Instructor,
  ProfessionalRegistration,
} from "@/src/app/modules/instructors/types";
import { formatCPFForDisplay, formatPhoneForDisplay } from "@/lib/utils";

interface InstructorCardProps {
  instructor: Instructor;
  onEdit: (instructor: Instructor) => void;
  onDelete: (instructor: Instructor) => Promise<void> | void;
}

export function InstructorCard({
  instructor,
  onEdit,
  onDelete,
}: InstructorCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
      <CardHeader>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 pb-3">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <CardTitle className="text-lg leading-tight line-clamp-2 max-w-full">
                {instructor.name}
              </CardTitle>
              {instructor.cpf && (
                <span className="text-sm text-slate-500">
                  CPF: {formatCPFForDisplay(instructor.cpf)}
                </span>
              )}
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
                <DropdownMenuItem onClick={() => onEdit(instructor)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>

                <AlertDialogBuilder
                  title="Excluir Instrutor"
                  description="Esta ação não pode ser desfeita. Deseja continuar?"
                  confirmText="Excluir"
                  variant="destructive"
                  onConfirm={() => onDelete(instructor)}
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
        {instructor.email && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="w-4 h-4" />
            <span className="wrap-break-word">{instructor.email}</span>
          </div>
        )}

        {instructor.phoneNumber && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4" />
            <span>{formatPhoneForDisplay(instructor.phoneNumber)}</span>
          </div>
        )}

        {instructor.professionalRegistrations &&
          instructor.professionalRegistrations.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {instructor.professionalRegistrations
                .filter((registration: ProfessionalRegistration) =>
                  Boolean(registration.type),
                )
                .map(
                  (registration: ProfessionalRegistration, index: number) => (
                    <span
                      key={index}
                      className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
                    >
                      {registration.type}
                    </span>
                  ),
                )}
            </div>
          )}
      </CardContent>
    </Card>
  );
}

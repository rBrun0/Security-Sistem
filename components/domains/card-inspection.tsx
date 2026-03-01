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
  ClipboardCheck,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import { AlertDialogBuilder } from "../builders/AlertDialogBuilder";
import type { Inspection } from "@/src/app/modules/inspections/types";
import { Separator } from "../ui/separator";

interface InspectionCardProps {
  inspection: Inspection;
  statusColors: Record<string, string>;
  onEdit: (inspection: Inspection) => void;
  onDelete: (inspection: Inspection) => Promise<void> | void;
}

export function InspectionCard({
  inspection,
  statusColors,
  onEdit,
  onDelete,
}: InspectionCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
      <CardHeader>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 pb-3">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <CardTitle className="text-lg leading-tight truncate max-w-full">
                {inspection.environment_name || "Inspeção"}
              </CardTitle>

              <Badge className={`${statusColors[inspection.status]} mt-1`}>
                {inspection.status === "pending"
                  ? "Pendente"
                  : inspection.status === "completed"
                    ? "Concluída"
                    : "Aprovada"}
              </Badge>
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
                <DropdownMenuItem onClick={() => onEdit(inspection)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>

                <AlertDialogBuilder
                  title="Inativar inspeção"
                  description={`Tem certeza que deseja inativar a inspeção "${inspection.environment_name}"?`}
                  onConfirm={() => onDelete(inspection)}
                  variant="destructive"
                >
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Inativar
                  </DropdownMenuItem>
                </AlertDialogBuilder>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator />
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{inspection.inspection_date}</span>
        </div>

        {inspection.observations && (
          <div className="text-sm text-slate-600">
            <p className="line-clamp-2">{inspection.observations}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

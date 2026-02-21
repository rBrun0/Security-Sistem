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
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight block truncate">
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

          <div className="shrink-0 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              {/* <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => onEdit(inspection)}>
                  <Edit className="mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(inspection)}
                >
                  <Trash2 className="mr-2" /> Remover
                </DropdownMenuItem>
              </DropdownMenuContent> */}
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(inspection)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>

                <AlertDialogBuilder
                  title="Remover inspeção"
                  description={`Tem certeza que deseja remover a inspeção "${inspection.environment_name}"?`}
                  onConfirm={() => onDelete(inspection)}
                  variant={"destructive"}
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
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{inspection.inspection_date}</span>
        </div>

        {inspection.observations && (
          <div className="text-sm text-slate-500">
            <p className="line-clamp-2">{inspection.observations}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

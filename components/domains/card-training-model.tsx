"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  User,
} from "lucide-react";
import { AlertDialogBuilder } from "../builders/AlertDialogBuilder";
import { TrainingModel } from "@/src/app/modules/models/types";

interface TrainingModelCardProps {
  model: TrainingModel;
  modalityColors: Record<string, string>;
  onEdit: (model: TrainingModel) => void;
  onDelete: (model: TrainingModel) => Promise<void> | void;
}

export function TrainingModelCard({
  model,
  modalityColors,
  onEdit,
  onDelete,
}: TrainingModelCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>

            <div className="min-w-0 flex-1">
              <CardTitle className="text-base leading-tight block truncate">
                {model.name}
              </CardTitle>
              <Badge className={modalityColors[model.modality || "presencial"]}>
                {model.modality === "ead"
                  ? "EAD"
                  : model.modality === "presencial"
                    ? "Presencial"
                    : "Semipresencial"}
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
                <DropdownMenuItem onClick={() => onEdit(model)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>

                <AlertDialogBuilder
                  title="Excluir Modelo"
                  description="Esta ação não pode ser desfeita. Deseja continuar?"
                  confirmText="Excluir"
                  variant="destructive"
                  onConfirm={() => onDelete(model)}
                >
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600"
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
        {model.standard && <Badge variant="outline">{model.standard}</Badge>}

        {model.workload && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>{model.workload}</span>
          </div>
        )}

        {model.instructorName && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <User className="w-4 h-4" />
            <span>{model.instructorName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  HardHat,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Calendar,
  Shield,
} from "lucide-react";
import { EPI } from "@/src/app/modules/epis/types";
import { AlertDialogBuilder } from "../builders/AlertDialogBuilder";

interface EPICardProps {
  epi: EPI;
  categoryLabel?: string;
  categoryClassName?: string;
  onEdit: (epi: EPI) => void;
  onDelete: (epi: EPI) => Promise<void> | void;
}

export function EPICard({
  epi,
  categoryLabel,
  categoryClassName,
  onEdit,
  onDelete,
}: EPICardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
      <CardHeader>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 pb-3">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <HardHat className="w-6 h-6 text-amber-600" />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <CardTitle className="text-lg leading-tight line-clamp-2 max-w-full">
                {epi.name}
              </CardTitle>

              {epi.category && (
                <Badge
                  className={categoryClassName || "bg-slate-100 text-slate-700"}
                >
                  {categoryLabel || epi.category}
                </Badge>
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
                <DropdownMenuItem onClick={() => onEdit(epi)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <AlertDialogBuilder
                  title="Inativar EPI"
                  description={`Tem certeza que deseja inativar o EPI "${epi.name}"?`}
                  onConfirm={() => onDelete(epi)}
                  variant="destructive"
                >
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onSelect={(event) => event.preventDefault()}
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

      <CardContent className="pt-3 space-y-3">
        {epi.ca && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield className="w-4 h-4" />
            <span>CA: {epi.ca}</span>
          </div>
        )}

        {epi.caValidity && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>Validade: {epi.caValidity}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Package className="w-4 h-4" />
          <span>Quantidade: {epi.quantity || 0}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <DollarSign className="w-4 h-4" />
          <span>Valor: R$ {(epi.unitValue || 0).toFixed(2)}</span>
        </div>

        {epi.centralWarehouseName && (
          <Badge variant="outline" className="mt-1">
            {epi.centralWarehouseName}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

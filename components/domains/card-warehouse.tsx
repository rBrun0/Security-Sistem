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
  Warehouse,
  MoreVertical,
  Edit,
  Trash2,
  MapPin,
  User,
  Package,
  CheckCircle,
} from "lucide-react";
import { CentralWarehouse } from "@/src/app/modules/central-warehouses/types";
import { AlertDialogBuilder } from "../builders/AlertDialogBuilder";

interface WarehouseCardProps {
  warehouse: CentralWarehouse;
  epiTypes: number;
  epiQuantity: number;
  onEdit: (warehouse: CentralWarehouse) => void;
  onDelete: (warehouse: CentralWarehouse) => Promise<void> | void;
}

export function WarehouseCard({
  warehouse,
  epiTypes,
  epiQuantity,
  onEdit,
  onDelete,
}: WarehouseCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
      <CardHeader>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 pb-3">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                warehouse.isActive ? "bg-amber-100" : "bg-slate-100"
              }`}
            >
              <Warehouse
                className={`w-6 h-6 ${
                  warehouse.isActive ? "text-amber-600" : "text-slate-400"
                }`}
              />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <CardTitle className="text-lg leading-tight line-clamp-2 max-w-full">
                {warehouse.name}
              </CardTitle>
              <Badge
                className={
                  warehouse.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }
              >
                {warehouse.isActive ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" /> Ativo
                  </>
                ) : (
                  "Inativo"
                )}
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
                <DropdownMenuItem onClick={() => onEdit(warehouse)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <AlertDialogBuilder
                  title="Inativar estoque"
                  description={`Tem certeza que deseja inativar o estoque "${warehouse.name}"?`}
                  onConfirm={() => onDelete(warehouse)}
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
        {warehouse.address && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="wrap-break-word">{warehouse.address}</span>
          </div>
        )}

        {warehouse.responsible && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4" />
            <span className="wrap-break-word">{warehouse.responsible}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Package className="w-4 h-4" />
          <span>
            {epiTypes} tipos de EPI • {epiQuantity} unidades
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

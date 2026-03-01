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
  Phone,
  User,
} from "lucide-react";
import type { Company } from "@/src/app/modules/companies/types";
import { formatPhoneForDisplay } from "@/lib/utils";
import { AlertDialogBuilder } from "../builders/AlertDialogBuilder";
import { Separator } from "../ui/separator";

interface CompanyCardProps {
  company: Company;
  statusColors: Record<string, string>;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => Promise<void> | void;
}

export function CompanyCard({
  company,
  statusColors,
  onEdit,
  onDelete,
}: CompanyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
      <CardHeader>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 pb-3">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <CardTitle className="text-lg leading-tight line-clamp-2 max-w-full">
                {company.name}
              </CardTitle>

              <Badge className={`${statusColors[company.status]} mt-1`}>
                {company.status === "active"
                  ? "Ativo"
                  : company.status === "inactive"
                    ? "Inativo"
                    : "Removido"}
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
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => onEdit(company)}>
                  <Edit className="mr-2" /> Editar
                </DropdownMenuItem>
                <AlertDialogBuilder
                  title="Remover empresa"
                  description={`Tem certeza que deseja remover a empresa "${company.name}"?`}
                  onConfirm={() => onDelete(company)}
                  variant="destructive"
                >
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Remover
                  </DropdownMenuItem>
                </AlertDialogBuilder>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator />
      </CardHeader>

      <CardContent className="pt-3 space-y-3">
        {company.document && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="wrap-break-word">{company.document}</span>
          </div>
        )}

        {company.address && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <span className="wrap-break-word">
              {company.address}
              {company.city && `, ${company.city}`}
              {company.state && ` - ${company.state}`}
            </span>
          </div>
        )}

        {company.contact_name && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4 shrink-0" />
            <span>{company.contact_name}</span>
          </div>
        )}

        {company.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 shrink-0" />
            <span>{formatPhoneForDisplay(company.phone)}</span>
          </div>
        )}

        {company.description && (
          <div className="text-sm text-slate-600 line-clamp-2">
            {company.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

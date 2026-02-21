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
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight block truncate">
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

          <div className="shrink-0 ml-2">
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
                <DropdownMenuItem onSelect={() => onDelete(company)}>
                  <Trash2 className="mr-2" /> Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {company.document && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="break-words">{company.document}</span>
          </div>
        )}

        {company.address && (
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <span className="break-words">
              {company.address}
              {company.city && `, ${company.city}`}
              {company.state && ` - ${company.state}`}
            </span>
          </div>
        )}

        {company.contact_name && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <User className="w-4 h-4 shrink-0" />
            <span>{company.contact_name}</span>
          </div>
        )}

        {company.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone className="w-4 h-4 shrink-0" />
            <span>{company.phone}</span>
          </div>
        )}

        {company.description && (
          <div className="text-sm text-slate-500">{company.description}</div>
        )}
      </CardContent>
    </Card>
  );
}

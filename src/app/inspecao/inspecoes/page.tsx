"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ClipboardCheck,
  Calendar,
  Search,
  Eye,
  CheckCircle,
  AlertTriangle,
  Building2,
  Camera,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPageUrl } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import { FormSelect } from "@/src/components/form/form-select";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InspecoesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  const inspecaoSchema = z.object({
    environment_id: z.string().min(1, "Obra é obrigatória"),
    inspection_date: z.string().min(1, "Data da inspeção é obrigatória"),
    observations: z.string().optional(),
  });

  type InspecaoFormData = z.infer<typeof inspecaoSchema>;

  const form = useForm<InspecaoFormData>({
    resolver: zodResolver(inspecaoSchema),
    defaultValues: {
      environment_id: "",
      inspection_date: new Date().toISOString().split("T")[0],
      observations: "",
    },
  });

  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: ambientes = [] } = useQuery({
    queryKey: ["ambientes"],
    queryFn: () => base44.entities.Ambiente.list(),
  });

  const { data: inspecoes = [], isLoading } = useQuery({
    queryKey: ["inspecoes"],
    queryFn: () => base44.entities.Inspecao.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Inspecao.create(data),
    onSuccess: (newInspecao) => {
      queryClient.invalidateQueries({ queryKey: ["inspecoes"] });
      setIsOpen(false);
      resetForm();
      toast.success("Inspeção criada com sucesso!");
      router.push(createPageUrl(`InspecaoDetalhe?id=${newInspecao.id}`));
    },
  });

  const resetForm = () => {
    form.reset({
      environment_id: "",
      inspection_date: new Date().toISOString().split("T")[0],
      observations: "",
    });
  };

  const onSubmit = (data: InspecaoFormData) => {
    const ambiente = ambientes.find((a) => a.id === data.environment_id);
    createMutation.mutate({
      obra_id: data.environment_id,
      obra_nome: ambiente?.nome || "",
      data_inspecao: data.inspection_date,
      observacoes: data.observations,
      status: "em_andamento",
      total_itens: 0,
      itens_conformes: 0,
      itens_nao_conformes: 0,
      percentual_conformidade: 0,
    });
  };

  const filteredInspecoes = inspecoes.filter((inspecao) => {
    const matchSearch = inspecao.obra_nome
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "todos" || inspecao.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Inspeções</h1>
          <p className="text-slate-500 mt-1">
            Gerencie as inspeções de segurança nas obras
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Inspeção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Inspeção</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormSelect
                  name="environment_id"
                  label="Obra"
                  control={form.control}
                  options={ambientes
                    .filter((a) => a.status === "ativo")
                    .map((ambiente) => ({
                      label: ambiente.nome,
                      value: ambiente.id,
                    }))}
                />
                <FormDatePicker
                  name="inspection_date"
                  label="Data da Inspeção"
                  control={form.control}
                />
                <FormTextarea
                  name="observations"
                  label="Observações"
                  control={form.control}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={createMutation.isPending}
                  >
                    Criar Inspeção
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por obra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredInspecoes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhuma inspeção encontrada"
                : "Nenhuma inspeção cadastrada"}
            </p>
            {!searchTerm && (
              //  obras.length > 0 &&
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Inspeção
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInspecoes.map((inspecao) => (
            <Link
              key={inspecao.id}
              href={createPageUrl(`InspecaoDetalhe?id=${inspecao.id}`)}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          inspecao.status === "concluida"
                            ? "bg-green-100"
                            : "bg-amber-100"
                        }`}
                      >
                        {inspecao.status === "concluida" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Camera className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                          {inspecao.obra_nome || "Obra não identificada"}
                        </CardTitle>
                        <Badge
                          variant={
                            inspecao.status === "concluida"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            inspecao.status === "concluida"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          }
                        >
                          {inspecao.status === "concluida"
                            ? "Concluída"
                            : "Em Andamento"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>{inspecao.data_inspecao}</span>
                  </div>

                  {inspecao.total_itens > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Conformidade</span>
                        <span
                          className={`font-medium ${
                            inspecao.percentual_conformidade >= 80
                              ? "text-green-600"
                              : inspecao.percentual_conformidade >= 50
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {inspecao.percentual_conformidade?.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            inspecao.percentual_conformidade >= 80
                              ? "bg-green-500"
                              : inspecao.percentual_conformidade >= 50
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{
                            width: `${inspecao.percentual_conformidade || 0}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {inspecao.itens_conformes} conformes
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          {inspecao.itens_nao_conformes} não conformes
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end">
                    <span className="text-sm text-emerald-600 font-medium group-hover:underline flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

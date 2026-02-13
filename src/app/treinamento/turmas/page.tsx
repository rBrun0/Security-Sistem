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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  GraduationCap,
  Calendar,
  Search,
  Eye,
  Clock,
  MapPin,
  Users,
  User,
  FileText,
  Building2,
} from "lucide-react";
import { createPageUrl } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/src/components/form/form-input";
import { FormSelect } from "@/src/components/form/form-select";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import { toast } from "sonner";

export default function TreinamentosPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalidade, setFilterModalidade] = useState("todas");
  const [selectedModelo, setSelectedModelo] = useState("");

  const turmaSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    standard: z.string().optional(),
    program_content: z.string().min(1, "Conteúdo programático é obrigatório"),
    workload: z.string().optional(),
    location: z.string().optional(),
    event_date: z.string().optional(),
    event_time: z.string().optional(),
    modality: z.enum(["presencial", "ead", "semipresencial"]),
    instructor_id: z.string().optional(),
    responsible_technical_id: z.string().optional(),
    certificate_model: z.string().optional(),
    environment_id: z.string().optional(),
  });

  type TurmaFormData = z.infer<typeof turmaSchema>;

  const form = useForm<TurmaFormData>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      title: "",
      standard: "",
      program_content: "",
      workload: "",
      location: "",
      event_date: "",
      event_time: "",
      modality: "presencial",
      instructor_id: "",
      responsible_technical_id: "",
      certificate_model: "modelo1",
      environment_id: "",
    },
  });

  const queryClient = useQueryClient();

  const { data: treinamentos = [], isLoading } = useQuery({
    queryKey: ["treinamentos"],
    queryFn: () => base44.entities.Treinamento.list("-created_date"),
  });

  const { data: modelos = [] } = useQuery({
    queryKey: ["modelos-treinamento"],
    queryFn: () => base44.entities.ModeloTreinamento.list(),
  });

  const { data: instrutores = [] } = useQuery({
    queryKey: ["instrutores"],
    queryFn: () => base44.entities.Instrutor.list(),
  });

  const { data: responsaveis = [] } = useQuery({
    queryKey: ["responsaveis-tecnicos"],
    queryFn: () => base44.entities.ResponsavelTecnico.list(),
  });

  const { data: ambientes = [] } = useQuery({
    queryKey: ["ambientes"],
    queryFn: () => base44.entities.Ambiente.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Treinamento.create(data),
    onSuccess: (newTreinamento) => {
      queryClient.invalidateQueries({ queryKey: ["treinamentos"] });
      setIsOpen(false);
      resetForm();
      toast.success("Turma criada com sucesso!");
      window.location.href = createPageUrl(
        `TreinamentoDetalhe?id=${newTreinamento.id}`,
      );
    },
  });

  const resetForm = () => {
    setSelectedModelo("");
    form.reset({
      title: "",
      standard: "",
      program_content: "",
      workload: "",
      location: "",
      event_date: "",
      event_time: "",
      modality: "presencial",
      instructor_id: "",
      responsible_technical_id: "",
      certificate_model: "modelo1",
      environment_id: "",
    });
  };

  const handleModeloChange = (modeloId) => {
    setSelectedModelo(modeloId);
    const modelo = modelos.find((m) => m.id === modeloId);
    if (modelo) {
      form.reset({
        title: modelo.nome,
        standard: modelo.norma,
        program_content: modelo.conteudo_programatico,
        workload: modelo.carga_horaria,
        location: form.getValues("location"),
        event_date: form.getValues("event_date"),
        event_time: form.getValues("event_time"),
        modality: modelo.modalidade || "presencial",
        instructor_id: modelo.instrutor_id || "",
        responsible_technical_id: modelo.responsavel_tecnico_id || "",
        certificate_model: modelo.modelo_certificado || "modelo1",
        environment_id: form.getValues("environment_id"),
      });
    }
  };

  const onSubmit = (data: TurmaFormData) => {
    const ambiente = ambientes.find((a) => a.id === data.environment_id);
    const instrutor = instrutores.find((i) => i.id === data.instructor_id);
    const responsavel = responsaveis.find(
      (r) => r.id === data.responsible_technical_id,
    );

    createMutation.mutate({
      titulo: data.title,
      norma: data.standard,
      conteudo_programatico: data.program_content,
      carga_horaria: data.workload,
      local: data.location,
      data_realizacao: data.event_date,
      horario: data.event_time,
      modalidade: data.modality,
      instrutor_id: data.instructor_id,
      instrutor_nome: instrutor?.nome,
      responsavel_tecnico_id: data.responsible_technical_id,
      responsavel_tecnico_nome: responsavel?.nome,
      modelo_certificado: data.certificate_model,
      ambiente_id: data.environment_id,
      ambiente_nome: ambiente?.nome,
      status: "agendado",
    });
  };

  const filteredTreinamentos = treinamentos.filter((t) => {
    const matchSearch =
      t.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.norma?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModalidade =
      filterModalidade === "todas" || t.modalidade === filterModalidade;
    return matchSearch && matchModalidade;
  });

  const modalidadeColors = {
    presencial: "bg-blue-100 text-blue-700",
    ead: "bg-purple-100 text-purple-700",
    semipresencial: "bg-teal-100 text-teal-700",
  };

  const statusColors = {
    agendado: "bg-amber-100 text-amber-700",
    em_andamento: "bg-blue-100 text-blue-700",
    concluido: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Turmas de Treinamento
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie as turmas de treinamento
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Turma de Treinamento</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {modelos.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <label className="text-sm font-medium">
                      Usar Modelo Pré-definido
                    </label>
                    <Select
                      value={selectedModelo}
                      onValueChange={handleModeloChange}
                    >
                      <SelectTrigger className="mt-2 bg-white">
                        <SelectValue placeholder="Selecione um modelo para preencher automaticamente" />
                      </SelectTrigger>
                      <SelectContent>
                        {modelos.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              {m.nome}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <FormInput
                  name="title"
                  label="Título da Turma"
                  control={form.control}
                />

                <FormInput
                  name="standard"
                  label="Norma"
                  control={form.control}
                />

                <FormTextarea
                  name="program_content"
                  label="Conteúdo Programático"
                  control={form.control}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="workload"
                    label="Carga Horária"
                    control={form.control}
                    placeholder="Ex: 8 horas"
                  />
                  <FormSelect
                    name="modality"
                    label="Modalidade"
                    control={form.control}
                    options={[
                      { label: "Presencial", value: "presencial" },
                      { label: "EAD", value: "ead" },
                      { label: "Semipresencial", value: "semipresencial" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormDatePicker
                    name="event_date"
                    label="Data de Realização"
                    control={form.control}
                  />
                  <FormInput
                    name="event_time"
                    label="Horário"
                    control={form.control}
                    placeholder="Ex: 08:00 às 17:00"
                  />
                </div>

                <FormSelect
                  name="environment_id"
                  label="Ambiente (Obra)"
                  control={form.control}
                  options={ambientes
                    .filter((a) => a.status === "ativo")
                    .map((a) => ({
                      label: a.nome,
                      value: a.id,
                    }))}
                />

                <FormInput
                  name="location"
                  label="Local de Realização"
                  control={form.control}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    name="instructor_id"
                    label="Instrutor"
                    control={form.control}
                    options={instrutores.map((i) => ({
                      label: i.nome,
                      value: i.id,
                    }))}
                  />
                  <FormSelect
                    name="responsible_technical_id"
                    label="Responsável Técnico"
                    control={form.control}
                    options={responsaveis.map((r) => ({
                      label: r.nome,
                      value: r.id,
                    }))}
                  />
                </div>

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
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Criar Turma
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
            placeholder="Buscar por título ou norma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={filterModalidade} onValueChange={setFilterModalidade}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas Modalidades</SelectItem>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="ead">EAD</SelectItem>
            <SelectItem value="semipresencial">Semipresencial</SelectItem>
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
      ) : filteredTreinamentos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhuma turma encontrada"
                : "Nenhuma turma cadastrada"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Turma
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTreinamentos.map((treinamento) => (
            <Link
              key={treinamento.id}
              to={createPageUrl(`TreinamentoDetalhe?id=${treinamento.id}`)}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md cursor-pointer group h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base group-hover:text-purple-600 transition-colors truncate">
                          {treinamento.titulo}
                        </CardTitle>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge
                            className={modalidadeColors[treinamento.modalidade]}
                          >
                            {treinamento.modalidade === "ead"
                              ? "EAD"
                              : treinamento.modalidade === "presencial"
                                ? "Presencial"
                                : "Semipresencial"}
                          </Badge>
                          <Badge className={statusColors[treinamento.status]}>
                            {treinamento.status === "agendado"
                              ? "Agendado"
                              : treinamento.status === "em_andamento"
                                ? "Em Andamento"
                                : "Concluído"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {treinamento.data_realizacao && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {treinamento.data_realizacao}{" "}
                        {treinamento.horario && `• ${treinamento.horario}`}
                      </span>
                    </div>
                  )}
                  {treinamento.carga_horaria && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{treinamento.carga_horaria}</span>
                    </div>
                  )}
                  {(treinamento.local || treinamento.ambiente_nome) && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Building2 className="w-4 h-4" />
                      <span className="truncate">
                        {treinamento.ambiente_nome || treinamento.local}
                      </span>
                    </div>
                  )}
                  {treinamento.instrutor_nome && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <User className="w-4 h-4" />
                      <span>{treinamento.instrutor_nome}</span>
                    </div>
                  )}
                  <div className="pt-2 flex items-center justify-end">
                    <span className="text-sm text-purple-600 font-medium group-hover:underline flex items-center gap-1">
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

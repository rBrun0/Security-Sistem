"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  User,
  Laptop,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/src/components/form/form-input";
import { FormSelect } from "@/src/components/form/form-select";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { toast } from "sonner";

const NORMAS = [
  { value: "NR-01 Disposições Gerais", label: "NR-01 - Disposições Gerais" },
  { value: "NR-06 EPI", label: "NR-06 - Equipamento de Proteção Individual" },
  {
    value: "NR-10 Segurança em Eletricidade",
    label: "NR-10 - Segurança em Instalações Elétricas",
  },
  {
    value: "NR-11 Transporte e Movimentação",
    label: "NR-11 - Transporte e Movimentação de Cargas",
  },
  {
    value: "NR-12 Segurança em Máquinas",
    label: "NR-12 - Segurança no Trabalho em Máquinas",
  },
  { value: "NR-18 Inicial", label: "NR-18 - Inicial (Construção Civil)" },
  {
    value: "NR-18 Condições e Meio Ambiente",
    label: "NR-18 - Condições e Meio Ambiente",
  },
  { value: "NR-33 Espaços Confinados", label: "NR-33 - Espaços Confinados" },
  { value: "NR-35 Trabalho em Altura", label: "NR-35 - Trabalho em Altura" },
];

const CONTEUDOS_PADRAO = {
  "NR-01 Disposições Gerais": {
    conteudo: `• Disposições gerais da NR-01
• Direitos e deveres do empregador
• Direitos e deveres do trabalhador
• Gerenciamento de Riscos Ocupacionais (GRO)
• Programa de Gerenciamento de Riscos (PGR)
• Prestação de informações digitais
• Capacitação e treinamento em SST`,
    carga_horaria: "4 horas",
  },
  "NR-06 EPI": {
    conteudo: `• Definição de EPI
• Obrigações do empregador
• Obrigações do empregado
• Certificado de Aprovação (CA)
• Uso correto dos EPIs
• Conservação e higienização
• Guarda e substituição
• Responsabilidades`,
    carga_horaria: "4 horas",
  },
  "NR-10 Segurança em Eletricidade": {
    conteudo: `• Introdução à segurança com eletricidade
• Riscos em instalações e serviços com eletricidade
• Técnicas de Análise de Risco
• Medidas de Controle do Risco Elétrico
• Equipamentos de proteção coletiva e individual
• Rotinas de trabalho - Procedimentos
• Documentação de instalações elétricas
• Riscos adicionais
• Proteção e combate a incêndios
• Acidentes de origem elétrica
• Primeiros socorros`,
    carga_horaria: "40 horas",
  },
  "NR-11 Transporte e Movimentação": {
    conteudo: `• Normas de segurança para operação de elevadores, guindastes, transportadores industriais e máquinas transportadoras
• Operação segura de equipamentos de transporte
• Inspeção prévia
• Capacidade de carga
• Sinalização
• Manutenção preventiva`,
    carga_horaria: "8 horas",
  },
  "NR-12 Segurança em Máquinas": {
    conteudo: `• Princípios gerais de segurança
• Arranjo físico e instalações
• Instalações e dispositivos elétricos
• Dispositivos de partida, acionamento e parada
• Sistemas de segurança
• Dispositivos de parada de emergência
• Meios de acesso permanentes
• Componentes pressurizados
• Transportadores de materiais
• Aspectos ergonômicos
• Riscos adicionais
• Manutenção, inspeção, preparação, ajustes e reparos
• Sinalização
• Manuais
• Procedimentos de trabalho e segurança`,
    carga_horaria: "8 horas",
  },
  "NR-18 Inicial": {
    conteudo: `• Informações sobre as condições e meio ambiente de trabalho
• Riscos inerentes à sua função
• Uso adequado dos Equipamentos de Proteção Individual – EPI
• Informações sobre os Equipamentos de Proteção Coletiva – EPC
• Primeiros Socorros
• Prevenção de acidentes`,
    carga_horaria: "6 horas",
  },
  "NR-18 Condições e Meio Ambiente": {
    conteudo: `• Condições e Meio Ambiente de Trabalho na Indústria da Construção
• Áreas de vivência
• Demolição
• Escavações, Fundações e Desmonte de Rochas
• Carpintaria
• Armações de Aço
• Estruturas de Concreto
• Estruturas Metálicas
• Operações de Soldagem e Corte a Quente
• Escadas, Rampas e Passarelas
• Medidas de Proteção contra Quedas de Altura
• Movimentação e Transporte de Materiais e Pessoas
• Andaimes e Plataformas de Trabalho
• Instalações Elétricas
• Máquinas, Equipamentos e Ferramentas Diversas
• Equipamentos de Proteção Individual
• Armazenagem e Estocagem de Materiais
• Proteção Contra Incêndio
• Sinalização de Segurança
• Treinamento`,
    carga_horaria: "8 horas",
  },
  "NR-33 Espaços Confinados": {
    conteudo: `• Definição, reconhecimento, avaliação e monitoramento de riscos
• Funcionamento de equipamentos utilizados
• Procedimentos e utilização da Permissão de Entrada e Trabalho (PET)
• Noções de resgate e primeiros socorros
• Riscos atmosféricos
• Medidas de controle`,
    carga_horaria: "16 horas",
  },
  "NR-35 Trabalho em Altura": {
    conteudo: `• Normas e regulamentos aplicáveis ao trabalho em altura
• Análise de Risco e condições impeditivas
• Riscos potenciais inerentes ao trabalho em altura e medidas de prevenção e controle
• Sistemas, equipamentos e procedimentos de proteção coletiva
• Equipamentos de Proteção Individual para trabalho em altura
• Acidentes típicos em trabalhos em altura
• Condutas em situações de emergência
• Noções de técnicas de resgate e de primeiros socorros`,
    carga_horaria: "8 horas",
  },
};

export default function ModelosTreinamentoPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const modeloSchema = z.object({
    standard: z.string().min(1, "Norma é obrigatória"),
    name: z.string().min(1, "Nome é obrigatório"),
    program_content: z.string().min(1, "Conteúdo programático é obrigatório"),
    workload: z.string().optional(),
    modality: z.enum(["presencial", "ead", "semipresencial"]),
    instructor_id: z.string().optional(),
    technical_responsible_id: z.string().optional(),
    certificate_model: z.string().optional(),
  });

  type ModeloFormData = z.infer<typeof modeloSchema>;

  const form = useForm<ModeloFormData>({
    resolver: zodResolver(modeloSchema),
    defaultValues: {
      standard: "",
      name: "",
      program_content: "",
      workload: "",
      modality: "presencial",
      instructor_id: "",
      technical_responsible_id: "",
      certificate_model: "modelo1",
    },
  });

  // Watch the standard field to auto-populate content
  const watchedStandard = form.watch("standard");
  useEffect(() => {
    if (watchedStandard) {
      handleNormaChange(watchedStandard);
    }
  }, [watchedStandard]);

  const queryClient = useQueryClient();

  const { data: modelos = [], isLoading } = useQuery({
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

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ModeloTreinamento.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modelos-treinamento"] });
      setIsOpen(false);
      resetForm();
      toast.success("Modelo criado com sucesso!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.entities.ModeloTreinamento.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modelos-treinamento"] });
      setIsOpen(false);
      setEditingModelo(null);
      resetForm();
      toast.success("Modelo atualizado com sucesso!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ModeloTreinamento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modelos-treinamento"] });
      toast.success("Modelo excluído com sucesso!");
    },
  });

  const resetForm = () => {
    form.reset({
      standard: "",
      name: "",
      program_content: "",
      workload: "",
      modality: "presencial",
      instructor_id: "",
      technical_responsible_id: "",
      certificate_model: "modelo1",
    });
  };

  const handleNormaChange = (value: string) => {
    const conteudoPadrao = CONTEUDOS_PADRAO[value];
    if (conteudoPadrao) {
      form.reset({
        standard: value,
        name: form.getValues("name") || value,
        program_content: conteudoPadrao.conteudo,
        workload: conteudoPadrao.carga_horaria,
        modality: form.getValues("modality"),
        instructor_id: form.getValues("instructor_id"),
        technical_responsible_id: form.getValues("technical_responsible_id"),
        certificate_model: form.getValues("certificate_model"),
      });
    } else {
      form.setValue("standard", value);
    }
  };

  const onSubmit = (data: ModeloFormData) => {
    const instrutor = instrutores.find((i) => i.id === data.instructor_id);
    const responsavel = responsaveis.find(
      (r) => r.id === data.technical_responsible_id,
    );

    const submitData = {
      norma: data.standard,
      nome: data.name,
      conteudo_programatico: data.program_content,
      carga_horaria: data.workload,
      modalidade: data.modality,
      instrutor_id: data.instructor_id,
      instrutor_nome: instrutor?.nome,
      responsavel_tecnico_id: data.technical_responsible_id,
      responsavel_tecnico_nome: responsavel?.nome,
      modelo_certificado: data.certificate_model,
    };

    if (editingModelo) {
      updateMutation.mutate({ id: editingModelo.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (modelo) => {
    setEditingModelo(modelo);
    form.reset({
      standard: modelo.norma || "",
      name: modelo.nome || "",
      program_content: modelo.conteudo_programatico || "",
      workload: modelo.carga_horaria || "",
      modality: modelo.modalidade || "presencial",
      instructor_id: modelo.instrutor_id || "",
      technical_responsible_id: modelo.responsavel_tecnico_id || "",
      certificate_model: modelo.modelo_certificado || "modelo1",
    });
    setIsOpen(true);
  };

  const filteredModelos = modelos.filter(
    (m) =>
      m.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.norma?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const modalidadeColors = {
    presencial: "bg-blue-100 text-blue-700",
    ead: "bg-purple-100 text-purple-700",
    semipresencial: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Modelos de Treinamento
          </h1>
          <p className="text-slate-500 mt-1">
            Crie modelos pré-definidos para criar turmas rapidamente
          </p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingModelo(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingModelo ? "Editar Modelo" : "Novo Modelo de Treinamento"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormSelect
                  name="standard"
                  label="Norma Regulamentadora"
                  control={form.control}
                  options={NORMAS.map((nr) => ({
                    label: nr.label,
                    value: nr.value,
                  }))}
                />

                <FormInput
                  name="name"
                  label="Nome do Modelo"
                  control={form.control}
                />

                <FormTextarea
                  name="program_content"
                  label="Conteúdo Programático"
                  control={form.control}
                  placeholder="Descreva o conteúdo programático..."
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
                  <FormSelect
                    name="instructor_id"
                    label="Instrutor Padrão"
                    control={form.control}
                    options={instrutores.map((i) => ({
                      label: i.nome,
                      value: i.id,
                    }))}
                  />
                  <FormSelect
                    name="technical_responsible_id"
                    label="Responsável Técnico Padrão"
                    control={form.control}
                    options={responsaveis.map((r) => ({
                      label: r.nome,
                      value: r.id,
                    }))}
                  />
                </div>

                <FormSelect
                  name="certificate_model"
                  label="Modelo de Certificado"
                  control={form.control}
                  options={[
                    { label: "Modelo 1 - Clássico", value: "modelo1" },
                    { label: "Modelo 2 - Moderno", value: "modelo2" },
                    { label: "Modelo 3 - Executivo", value: "modelo3" },
                  ]}
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
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {editingModelo ? "Salvar" : "Criar Modelo"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome ou norma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
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
      ) : filteredModelos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhum modelo encontrado"
                : "Nenhum modelo cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Modelo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModelos.map((modelo) => (
            <Card
              key={modelo.id}
              className="hover:shadow-lg transition-shadow border-0 shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{modelo.nome}</CardTitle>
                      <Badge className={modalidadeColors[modelo.modalidade]}>
                        {modelo.modalidade === "ead"
                          ? "EAD"
                          : modelo.modalidade === "presencial"
                            ? "Presencial"
                            : "Semipresencial"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(modelo)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (confirm("Deseja excluir este modelo?")) {
                            deleteMutation.mutate(modelo.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="outline">{modelo.norma}</Badge>
                {modelo.carga_horaria && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{modelo.carga_horaria}</span>
                  </div>
                )}
                {modelo.instrutor_nome && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <User className="w-4 h-4" />
                    <span>{modelo.instrutor_nome}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

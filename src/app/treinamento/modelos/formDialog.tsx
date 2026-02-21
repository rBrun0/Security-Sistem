"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { FormInput, FormSelect, FormTextarea } from "@/src/components/form";
import { Form } from "@/components/ui/form";

import { useTechnicalResponsibles } from "@/src/app/modules/responsaveistecnicos/hooks";
import { useInstructors } from "../../modules/instructors/hooks";
import {
  useCreateTrainingModel,
  useUpdateTrainingModel,
} from "../../modules/models/hooks";
import { TrainingModel } from "../../modules/models/types";
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

type DefaultStandardContent = {
  conteudo: string;
  carga_horaria: string;
};

const CONTEUDOS_PADRAO: Record<string, DefaultStandardContent> = {
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

export const FormDialog = ({
  isOpen,
  setIsOpen,
  editingModel,
  setEditingModel,
}: {
  editingModel: TrainingModel | null;
  setEditingModel: Dispatch<SetStateAction<TrainingModel | null>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
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

  const selectedStandard = useWatch({
    control: form.control,
    name: "standard",
  });

  // Use centralized hooks/services
  const { data: instrutores = [] } = useInstructors();
  const { data: responsaveis = [] } = useTechnicalResponsibles();

  const createMutation = useCreateTrainingModel();
  const updateMutation = useUpdateTrainingModel();

  useEffect(() => {
    if (!isOpen) return;

    if (editingModel) {
      form.reset({
        standard: editingModel.standard || "",
        name: editingModel.name || "",
        program_content: editingModel.programContent || "",
        workload: editingModel.workload || "",
        modality: editingModel.modality || "presencial",
        instructor_id: editingModel.instructorId || "",
        technical_responsible_id: editingModel.technicalResponsibleId || "",
        certificate_model: editingModel.certificateModel || "modelo1",
      });
    } else {
      form.reset();
    }
  }, [editingModel, form, isOpen]);

  useEffect(() => {
    if (!isOpen || editingModel) return;

    const conteudoPadrao = CONTEUDOS_PADRAO[selectedStandard];
    if (!conteudoPadrao) return;

    form.setValue("program_content", conteudoPadrao.conteudo);
    form.setValue("workload", conteudoPadrao.carga_horaria);

    if (!form.getValues("name")) {
      form.setValue("name", selectedStandard);
    }
  }, [editingModel, form, isOpen, selectedStandard]);

  const onSubmit = (data: ModeloFormData) => {
    const instrutor = instrutores.find((i) => i.id === data.instructor_id);
    const responsavel = responsaveis.find(
      (r) => r.id === data.technical_responsible_id,
    );

    const submitData: Omit<TrainingModel, "id"> = {
      standard: data.standard,
      name: data.name,
      programContent: data.program_content,
      workload: data.workload,
      modality: data.modality,
      instructorId: data.instructor_id,
      instructorName: instrutor?.name,
      technicalResponsibleId: data.technical_responsible_id,
      technicalResponsibleName: responsavel?.name,
      certificateModel: data.certificate_model,
    };

    if (editingModel?.id) {
      updateMutation.mutate(
        { id: editingModel.id, data: submitData },
        {
          onSuccess: () => {
            setIsOpen(false);
            setEditingModel(null);
            form.reset();
            toast.success("Modelo atualizado com sucesso!");
          },
        },
      );
    } else {
      createMutation.mutate(submitData, {
        onSuccess: () => {
          setIsOpen(false);
          form.reset();
          toast.success("Modelo cadastrado com sucesso!");
        },
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setEditingModel(null);
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => {
            setEditingModel(null);
            form.reset();
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Modelo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingModel ? "Editar Modelo" : "Novo Modelo de Treinamento"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                options={instrutores
                  .filter((i) => Boolean(i.id))
                  .map((i) => ({
                    label: i.name || "Sem nome",
                    value: i.id as string,
                  }))}
              />
              <FormSelect
                name="technical_responsible_id"
                label="Responsável Técnico Padrão"
                control={form.control}
                options={responsaveis
                  .filter((r) => Boolean(r.id))
                  .map((r) => ({
                    label: r.name || "Sem nome",
                    value: r.id as string,
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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingModel ? "Salvar" : "Criar Modelo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

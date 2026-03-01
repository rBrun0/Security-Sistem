"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
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
  DialogFooter,
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
  User,
  FileText,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/src/components/form/form-input";
import { FormSelect } from "@/src/components/form/form-select";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import { toast } from "sonner";
import { useInstructors } from "../../modules/instructors/hooks";
import { useTechnicalResponsibles } from "../../modules/responsaveistecnicos/hooks";
import { useTrainingModels } from "../../modules/models/hooks";
import { TrainingModel } from "../../modules/models/types";
import { useEnvironments } from "../../modules/enviroments/hooks";
import { useCreateTraining, useTrainings } from "../../modules/trainings/hooks";
import { TrainingCard } from "@/components/domains/card-training";
import {
  EmptyStateCard,
  LoadingCardGrid,
  PageHeader,
} from "@/src/components/common";

export default function TreinamentosPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalidade, setFilterModalidade] = useState("todas");
  const [selectedModelo, setSelectedModelo] = useState("");

  const turmaSchema = z.object({
    title: z.string().trim().min(1, "Informe o título da turma."),
    standard: z.string().trim().optional(),
    program_content: z
      .string()
      .trim()
      .min(1, "Informe o conteúdo programático."),
    workload: z.string().trim().optional(),
    location: z.string().trim().optional(),
    event_date: z.string().optional(),
    event_time: z.string().optional(),
    modality: z.enum(["presencial", "ead", "semipresencial"], {
      error: "Modalidade inválida.",
    }),
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

  const { data: treinamentos = [], isLoading } = useTrainings();

  const { data: modelos = [] } = useTrainingModels();

  // Fetch instructors and technical responsibles via services/hooks
  const { data: instrutores = [] } = useInstructors();
  const { data: responsaveis = [] } = useTechnicalResponsibles();

  const { data: ambientes = [] } = useEnvironments();

  const createMutation = useCreateTraining();

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

  const handleModeloChange = (modeloId: string) => {
    setSelectedModelo(modeloId);
    const modelo = modelos.find((m: TrainingModel) => m.id === modeloId);
    if (modelo) {
      form.reset({
        title: modelo.name || "",
        standard: modelo.standard || "",
        program_content: modelo.programContent || "",
        workload: modelo.workload || "",
        location: form.getValues("location"),
        event_date: form.getValues("event_date"),
        event_time: form.getValues("event_time"),
        modality: modelo.modality || "presencial",
        instructor_id: modelo.instructorId || "",
        responsible_technical_id: modelo.technicalResponsibleId || "",
        certificate_model: modelo.certificateModel || "modelo1",
        environment_id: form.getValues("environment_id"),
      });
    }
  };

  const onSubmit = (data: TurmaFormData) => {
    const ambiente = ambientes.find(
      (environment) => environment.id === data.environment_id,
    );
    const instrutor = instrutores.find((i) => i.id === data.instructor_id);
    const responsavel = responsaveis.find(
      (r) => r.id === data.responsible_technical_id,
    );

    createMutation.mutate(
      {
        title: data.title,
        standard: data.standard,
        programContent: data.program_content,
        workload: data.workload,
        location: data.location,
        eventDate: data.event_date,
        eventTime: data.event_time,
        modality: data.modality,
        instructorId: data.instructor_id,
        instructorName: instrutor?.name,
        technicalResponsibleId: data.responsible_technical_id,
        technicalResponsibleName: responsavel?.name,
        certificateModel: data.certificate_model,
        environmentId: data.environment_id,
        environmentName: ambiente?.name,
        status: "scheduled",
      },
      {
        onSuccess: (newTraining) => {
          setIsOpen(false);
          resetForm();
          toast.success("Turma criada com sucesso!");
          window.location.assign(`/treinamento/turmas/${newTraining.id}`);
        },
      },
    );
  };

  const filteredTreinamentos = treinamentos.filter((t) => {
    const matchSearch =
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.standard?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModalidade =
      filterModalidade === "todas" || t.modality === filterModalidade;
    return matchSearch && matchModalidade;
  });

  const modalidadeColors = {
    presencial: "bg-blue-100 text-blue-700",
    ead: "bg-purple-100 text-purple-700",
    semipresencial: "bg-teal-100 text-teal-700",
  };

  const statusColors = {
    scheduled: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Turmas de Treinamento"
        description="Gerencie as turmas de treinamento"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col p-0">
              <DialogHeader className="border-b p-6">
                <DialogTitle>Nova Turma de Treinamento</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <Form {...form}>
                  <form
                    id="training-form"
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
                            {modelos
                              .filter((m: TrainingModel) => Boolean(m.id))
                              .map((m: TrainingModel) => (
                                <SelectItem key={m.id} value={m.id as string}>
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {m.name}
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
                        .filter(
                          (environment) => environment.status === "active",
                        )
                        .map((environment) => ({
                          label: environment.name || "Sem nome",
                          value: environment.id,
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
                        options={instrutores
                          .filter((i) => Boolean(i.id))
                          .map((i) => ({
                            label: i.name || "Sem nome",
                            value: i.id as string,
                          }))}
                      />
                      <FormSelect
                        name="responsible_technical_id"
                        label="Responsável Técnico"
                        control={form.control}
                        options={responsaveis
                          .filter((r) => Boolean(r.id))
                          .map((r) => ({
                            label: r.name || "Sem nome",
                            value: r.id as string,
                          }))}
                      />
                    </div>
                  </form>
                </Form>
              </div>
              <DialogFooter className="border-t p-1">
                <div className="flex justify-end gap-3 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    form="training-form"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Criar Turma
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

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
        <LoadingCardGrid lineWidths={["w-3/4", "w-1/2"]} />
      ) : filteredTreinamentos.length === 0 ? (
        <EmptyStateCard
          icon={GraduationCap}
          message={
            searchTerm ? "Nenhuma turma encontrada" : "Nenhuma turma cadastrada"
          }
          actionLabel={!searchTerm ? "Criar Primeira Turma" : undefined}
          actionIcon={!searchTerm ? Plus : undefined}
          onAction={!searchTerm ? () => setIsOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTreinamentos.map((treinamento) => (
            <Link
              key={treinamento.id}
              href={`/treinamento/turmas/${treinamento.id}`}
            >
              <TrainingCard
                training={treinamento}
                modalityColors={modalidadeColors}
                statusColors={statusColors}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

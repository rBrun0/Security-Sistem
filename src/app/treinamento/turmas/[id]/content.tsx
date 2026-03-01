"use client";

import { useState } from "react";
import { formatCPFForDisplay } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useTraining,
  useUpdateTraining,
} from "@/src/app/modules/trainings/hooks";
import {
  useCreateTrainingParticipant,
  useCreateTrainingParticipants,
  useDeleteTrainingParticipant,
  useTrainingParticipants,
} from "@/src/app/modules/training-participants/hooks";
import { useEmployees } from "@/src/app/modules/employees/hooks";
import { useInstructors } from "@/src/app/modules/instructors/hooks";
import { useTechnicalResponsibles } from "@/src/app/modules/responsaveistecnicos/hooks";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
  User,
  UserCheck,
  Users,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { AlertDialogBuilder } from "@/components/builders/AlertDialogBuilder";

type ParticipantFormState = {
  employeeId: string;
  name: string;
  cpf: string;
  company: string;
  role: string;
};

type EditFormState = {
  title: string;
  standard: string;
  programContent: string;
  workload: string;
  location: string;
  eventDate: string;
  eventTime: string;
  modality: "presencial" | "ead" | "semipresencial";
  instructorId: string;
  technicalResponsibleId: string;
};

export default function TurmaDetalhePage() {
  const [isAddParticipante, setIsAddParticipante] = useState(false);
  const [isEditTreinamento, setIsEditTreinamento] = useState(false);
  const [participantTab, setParticipantTab] = useState("colaborador");
  const [participanteForm, setParticipanteForm] =
    useState<ParticipantFormState>({
      employeeId: "",
      name: "",
      cpf: "",
      company: "",
      role: "",
    });
  const [multipleParticipantes, setMultipleParticipantes] = useState("");
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    standard: "",
    programContent: "",
    workload: "",
    location: "",
    eventDate: "",
    eventTime: "",
    modality: "presencial",
    instructorId: "",
    technicalResponsibleId: "",
  });

  const params = useParams();
  const turmaId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined;

  const { data: treinamento, isLoading: loadingTreinamento } =
    useTraining(turmaId);
  const { data: participants = [], isLoading: loadingParticipants } =
    useTrainingParticipants(turmaId);
  const { data: colaboradores = [] } = useEmployees();
  const { data: instrutores = [] } = useInstructors();
  const { data: responsaveis = [] } = useTechnicalResponsibles();

  const updateTrainingMutation = useUpdateTraining();
  const addParticipanteMutation = useCreateTrainingParticipant(turmaId);
  const addMultipleParticipantesMutation =
    useCreateTrainingParticipants(turmaId);
  const deleteParticipanteMutation = useDeleteTrainingParticipant(turmaId);

  const instrutor = instrutores.find(
    (item) => item.id === treinamento?.instructorId,
  );
  const responsavel = responsaveis.find(
    (item) => item.id === treinamento?.technicalResponsibleId,
  );

  const resetParticipanteForm = () => {
    setParticipanteForm({
      employeeId: "",
      name: "",
      cpf: "",
      company: "",
      role: "",
    });
  };

  const openEditForm = () => {
    if (!treinamento) return;

    setEditForm({
      title: treinamento.title || "",
      standard: treinamento.standard || "",
      programContent: treinamento.programContent || "",
      workload: treinamento.workload || "",
      location: treinamento.location || "",
      eventDate: treinamento.eventDate || "",
      eventTime: treinamento.eventTime || "",
      modality: treinamento.modality || "presencial",
      instructorId: treinamento.instructorId || "",
      technicalResponsibleId: treinamento.technicalResponsibleId || "",
    });

    setIsEditTreinamento(true);
  };

  const handleColaboradorChange = (employeeId: string) => {
    const colaborador = colaboradores.find((item) => item.id === employeeId);

    setParticipanteForm({
      employeeId,
      name: colaborador?.name || "",
      cpf: colaborador?.cpf || "",
      company: colaborador?.company || "",
      role: colaborador?.job_title || colaborador?.role || "",
    });
  };

  const handleAddParticipante = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!turmaId || !participanteForm.name.trim()) return;

    addParticipanteMutation.mutate(
      {
        trainingId: turmaId,
        employeeId: participanteForm.employeeId || undefined,
        name: participanteForm.name.trim(),
        cpf: participanteForm.cpf.trim() || undefined,
        company: participanteForm.company.trim() || undefined,
        role: participanteForm.role.trim() || undefined,
        signatureToken: Math.random().toString(36).substring(2, 15),
      },
      {
        onSuccess: () => {
          toast.success("Participante adicionado!");
          resetParticipanteForm();
          setIsAddParticipante(false);
        },
      },
    );
  };

  const handleAddMultiple = () => {
    if (!turmaId) return;

    const lines = multipleParticipantes
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const participantesData = lines
      .map((line) => {
        const parts = line.split(";").map((part) => part.trim());

        return {
          trainingId: turmaId,
          name: parts[0] || "",
          cpf: parts[1] || undefined,
          company: parts[2] || undefined,
          role: parts[3] || undefined,
          signatureToken: Math.random().toString(36).substring(2, 15),
        };
      })
      .filter((item) => item.name);

    if (!participantesData.length) {
      toast.error("Nenhum participante válido para adicionar.");
      return;
    }

    addMultipleParticipantesMutation.mutate(participantesData, {
      onSuccess: () => {
        toast.success("Participantes adicionados!");
        setMultipleParticipantes("");
        setIsAddParticipante(false);
      },
    });
  };

  const generateSignatureLink = (token?: string) => {
    if (!token || typeof window === "undefined") return "";
    return `${window.location.origin}/treinamento/assinatura?token=${token}&tipo=participante`;
  };

  const copyLink = async (token?: string) => {
    const link = generateSignatureLink(token);
    if (!link) {
      toast.error("Link de assinatura indisponível.");
      return;
    }

    await navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const handleConcluir = () => {
    if (!turmaId) return;

    updateTrainingMutation.mutate(
      {
        id: turmaId,
        data: { status: "completed" },
      },
      {
        onSuccess: () => toast.success("Treinamento concluído!"),
      },
    );
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!turmaId) return;

    const instrutorSelecionado = instrutores.find(
      (item) => item.id === editForm.instructorId,
    );
    const responsavelSelecionado = responsaveis.find(
      (item) => item.id === editForm.technicalResponsibleId,
    );

    updateTrainingMutation.mutate(
      {
        id: turmaId,
        data: {
          title: editForm.title,
          standard: editForm.standard,
          programContent: editForm.programContent,
          workload: editForm.workload,
          location: editForm.location,
          eventDate: editForm.eventDate,
          eventTime: editForm.eventTime,
          modality: editForm.modality,
          instructorId: editForm.instructorId,
          instructorName: instrutorSelecionado?.name,
          technicalResponsibleId: editForm.technicalResponsibleId,
          technicalResponsibleName: responsavelSelecionado?.name,
        },
      },
      {
        onSuccess: () => {
          toast.success("Treinamento atualizado!");
          setIsEditTreinamento(false);
        },
      },
    );
  };

  if (loadingTreinamento) {
    return (
      <div className="flex items-center justify-center min-h-80">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!treinamento) {
    return (
      <div className="space-y-4">
        <Link href="/treinamento/turmas">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para turmas
          </Button>
        </Link>
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-slate-500">
            Turma não encontrada.
          </CardContent>
        </Card>
      </div>
    );
  }

  const modalidadeColors: Record<string, string> = {
    presencial: "bg-blue-100 text-blue-700",
    ead: "bg-purple-100 text-purple-700",
    semipresencial: "bg-teal-100 text-teal-700",
  };

  const statusColors: Record<string, string> = {
    scheduled: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/treinamento/turmas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {treinamento.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={
                  modalidadeColors[treinamento.modality || "presencial"]
                }
              >
                {treinamento.modality === "ead"
                  ? "EAD"
                  : treinamento.modality === "semipresencial"
                    ? "Semipresencial"
                    : "Presencial"}
              </Badge>
              <Badge
                className={statusColors[treinamento.status || "scheduled"]}
              >
                {treinamento.status === "completed"
                  ? "Concluído"
                  : treinamento.status === "in_progress"
                    ? "Em Andamento"
                    : "Agendado"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {treinamento.status !== "completed" && (
            <>
              <Button variant="outline" onClick={openEditForm}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" onClick={handleConcluir}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluir
              </Button>
            </>
          )}
          <Link href={`/treinamento/certificados?treinamento_id=${turmaId}`}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Award className="w-4 h-4 mr-2" />
              Certificados
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Data</p>
              <p className="font-medium">
                {treinamento.eventDate || "Não definida"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Carga horária</p>
              <p className="font-medium">
                {treinamento.workload || "Não definida"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Local</p>
              <p className="font-medium truncate text-sm">
                {treinamento.environmentName ||
                  treinamento.location ||
                  "Não definido"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Participantes</p>
              <p className="font-medium">{participants.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="participantes" className="space-y-6">
        <TabsList className="bg-white shadow-sm">
          <TabsTrigger value="participantes">Participantes</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo Programático</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
        </TabsList>

        <TabsContent value="participantes">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                Participantes ({participants.length})
              </CardTitle>
              {treinamento.status !== "completed" && (
                <Button
                  onClick={() => setIsAddParticipante(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loadingParticipants ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Nenhum participante cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-slate-500">
                            {participant.cpf
                              ? formatCPFForDisplay(participant.cpf)
                              : "Sem CPF"}
                            {participant.company
                              ? ` • ${participant.company}`
                              : ""}
                          </p>
                        </div>
                        {participant.signed && (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Assinado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(participant.signatureToken)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Link
                        </Button>
                        {treinamento.status !== "completed" &&
                          participant?.id && (
                            // <Button
                            //   variant="ghost"
                            //   size="icon"
                            //   className="text-red-500 hover:text-red-700"
                            //   onClick={() => {
                            //     if (
                            //       window.confirm("Remover este participante?")
                            //     ) {
                            //       deleteParticipanteMutation.mutate(
                            //         participant.id as string,
                            //         {
                            //           onSuccess: () =>
                            //             toast.success("Participante removido!"),
                            //         },
                            //       );
                            //     }
                            //   }}
                            // >
                            //   <Trash2 className="w-4 h-4" />
                            // </Button>
                            <AlertDialogBuilder
                              title="Remover participante"
                              description={`Tem certeza que deseja remover o participante "${participant.name}"?`}
                              onConfirm={() =>
                                deleteParticipanteMutation.mutate(
                                  participant.id as string,
                                  {
                                    onSuccess: () => {
                                      toast.success("Participante removido!");
                                    },
                                  },
                                )
                              }
                              variant={"destructive"}
                            >
                              <Button
                                variant={"ghost"}
                                className="flex justify-center items-center text-red-600 hover:bg-red-100 hover:text-red-600 transition-colors "
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogBuilder>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conteudo">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Conteúdo Programático
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap bg-slate-50 p-4 rounded-lg text-sm">
                {treinamento.programContent || "Nenhum conteúdo definido"}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipe">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Instrutor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {instrutor ? (
                  <div className="space-y-3">
                    <p className="font-medium text-lg">{instrutor.name}</p>
                    {instrutor.qualifications && (
                      <p className="text-sm text-slate-500">
                        {instrutor.qualifications}
                      </p>
                    )}
                    {!!instrutor.professionalRegistrations?.length && (
                      <div className="flex flex-wrap gap-2">
                        {instrutor.professionalRegistrations.map(
                          (registro, index) => (
                            <Badge
                              key={`${registro.type}-${registro.number}-${index}`}
                              variant="outline"
                            >
                              {registro.type}: {registro.number}
                            </Badge>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500">Nenhum instrutor selecionado</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Responsável Técnico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {responsavel ? (
                  <div className="space-y-3">
                    <p className="font-medium text-lg">{responsavel.name}</p>
                    {responsavel.qualifications && (
                      <p className="text-sm text-slate-500">
                        {responsavel.qualifications}
                      </p>
                    )}
                    {!!responsavel.professionalRegistrations?.length && (
                      <div className="flex flex-wrap gap-2">
                        {responsavel.professionalRegistrations.map(
                          (registro, index) => (
                            <Badge
                              key={`${registro.type}-${registro.number}-${index}`}
                              variant="outline"
                            >
                              {registro.type}: {registro.number}
                            </Badge>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500">
                    Nenhum responsável técnico selecionado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddParticipante} onOpenChange={setIsAddParticipante}>
        <DialogContent className="flex max-h-[90vh] max-w-lg flex-col p-0">
          <DialogHeader className="border-b p-6">
            <DialogTitle>Adicionar Participante</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <Tabs
              value={participantTab}
              onValueChange={setParticipantTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="colaborador">Colaborador</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
                {/* <TabsTrigger value="multiplos">Múltiplos</TabsTrigger> */}
              </TabsList>

              <TabsContent value="colaborador">
                <form
                  id="participant-colaborador-form"
                  onSubmit={handleAddParticipante}
                  className="space-y-4 mt-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label>Selecionar Colaborador</Label>
                    <Select
                      value={participanteForm.employeeId}
                      onValueChange={handleColaboradorChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        {colaboradores
                          .filter(
                            (colaborador) => colaborador.status === "active",
                          )
                          .map((colaborador) => (
                            <SelectItem
                              key={colaborador.id}
                              value={colaborador.id}
                            >
                              {colaborador.name} -{" "}
                              {formatCPFForDisplay(colaborador.cpf)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {participanteForm.name && (
                    <div className="p-4 bg-slate-50 rounded-lg text-sm space-y-1">
                      <p>
                        <strong>Nome:</strong> {participanteForm.name}
                      </p>
                      <p>
                        <strong>CPF:</strong>{" "}
                        {participanteForm.cpf
                          ? formatCPFForDisplay(participanteForm.cpf)
                          : "-"}
                      </p>
                      {participanteForm.company && (
                        <p>
                          <strong>Empresa:</strong> {participanteForm.company}
                        </p>
                      )}
                    </div>
                  )}
                </form>
              </TabsContent>

              <TabsContent value="manual">
                <form
                  id="participant-manual-form"
                  onSubmit={handleAddParticipante}
                  className="space-y-4 mt-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      value={participanteForm.name}
                      onChange={(e) =>
                        setParticipanteForm((old) => ({
                          ...old,
                          employeeId: "",
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>CPF *</Label>
                    <Input
                      value={participanteForm.cpf}
                      onChange={(e) =>
                        setParticipanteForm((old) => ({
                          ...old,
                          cpf: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Empresa</Label>
                    <Input
                      value={participanteForm.company}
                      onChange={(e) =>
                        setParticipanteForm((old) => ({
                          ...old,
                          company: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Cargo</Label>
                    <Input
                      value={participanteForm.role}
                      onChange={(e) =>
                        setParticipanteForm((old) => ({
                          ...old,
                          role: e.target.value,
                        }))
                      }
                    />
                  </div>
                </form>
              </TabsContent>

              {/* <TabsContent value="multiplos">
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Lista de Participantes</Label>
                  <p className="text-sm text-slate-500 mb-2">
                    Uma pessoa por linha: Nome; CPF; Empresa; Cargo
                  </p>
                  <Textarea
                    rows={8}
                    placeholder="João Silva; 123.456.789-00; Empresa ABC; Pedreiro"
                    value={multipleParticipantes}
                    onChange={(e) => setMultipleParticipantes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddParticipante(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddMultiple}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={
                      addMultipleParticipantesMutation.isPending ||
                      !multipleParticipantes.trim()
                    }
                  >
                    Adicionar Todos
                  </Button>
                </div>
              </div>
            </TabsContent> */}
            </Tabs>
          </div>
          <DialogFooter className="border-t p-1">
            <div className="flex justify-end gap-3 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddParticipante(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form={
                  participantTab === "manual"
                    ? "participant-manual-form"
                    : "participant-colaborador-form"
                }
                className="bg-purple-600 hover:bg-purple-700"
                disabled={
                  addParticipanteMutation.isPending ||
                  (participantTab === "colaborador" && !participanteForm.name)
                }
              >
                Adicionar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTreinamento} onOpenChange={setIsEditTreinamento}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col p-0">
          <DialogHeader className="border-b p-6">
            <DialogTitle>Editar Treinamento</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <form
              id="edit-training-form"
              onSubmit={handleSaveEdit}
              className="space-y-4"
            >
              <div>
                <Label>Título *</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((old) => ({ ...old, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label>Norma</Label>
                <Input
                  value={editForm.standard}
                  onChange={(e) =>
                    setEditForm((old) => ({ ...old, standard: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Conteúdo Programático</Label>
                <Textarea
                  rows={5}
                  value={editForm.programContent}
                  onChange={(e) =>
                    setEditForm((old) => ({
                      ...old,
                      programContent: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Carga Horária</Label>
                  <Input
                    value={editForm.workload}
                    onChange={(e) =>
                      setEditForm((old) => ({
                        ...old,
                        workload: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Modalidade</Label>
                  <Select
                    value={editForm.modality}
                    onValueChange={(
                      value: "presencial" | "ead" | "semipresencial",
                    ) => setEditForm((old) => ({ ...old, modality: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="ead">EAD</SelectItem>
                      <SelectItem value="semipresencial">
                        Semipresencial
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={editForm.eventDate}
                    onChange={(e) =>
                      setEditForm((old) => ({
                        ...old,
                        eventDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Horário</Label>
                  <Input
                    value={editForm.eventTime}
                    onChange={(e) =>
                      setEditForm((old) => ({
                        ...old,
                        eventTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Local</Label>
                <Input
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((old) => ({ ...old, location: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Instrutor</Label>
                  <Select
                    value={editForm.instructorId}
                    onValueChange={(value) =>
                      setEditForm((old) => ({ ...old, instructorId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {instrutores.map((instrutorItem) => (
                        <SelectItem
                          key={instrutorItem.id}
                          value={instrutorItem.id || ""}
                        >
                          {instrutorItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Responsável Técnico</Label>
                  <Select
                    value={editForm.technicalResponsibleId}
                    onValueChange={(value) =>
                      setEditForm((old) => ({
                        ...old,
                        technicalResponsibleId: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsaveis.map((responsavelItem) => (
                        <SelectItem
                          key={responsavelItem.id}
                          value={responsavelItem.id || ""}
                        >
                          {responsavelItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </div>
          <DialogFooter className="border-t p-1">
            <div className="flex justify-end gap-3 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditTreinamento(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="edit-training-form"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={updateTrainingMutation.isPending}
              >
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

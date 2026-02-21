"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardCheck,
  GraduationCap,
  HardHat,
  Building2,
  Users,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { createPageUrl } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useEnvironments } from "./modules/enviroments/hooks";
import { useEmployees } from "./modules/employees/hooks";
import { useInspections } from "./modules/inspections/hooks";
import { useTrainings } from "./modules/trainings/hooks";
import { useEPIs } from "./modules/epis/hooks";
import { Inspection } from "./modules/inspections/types";
import { Training } from "./modules/trainings/types";

const inspectionStatusLabel: Record<string, string> = {
  pending: "Pendente",
  completed: "Concluída",
  approved: "Aprovada",
};

const trainingModalityLabel: Record<string, string> = {
  presencial: "PRESENCIAL",
  ead: "EAD",
  semipresencial: "SEMIPRESENCIAL",
};

function toDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value?: string) {
  const parsed = toDate(value);
  if (parsed) {
    return format(parsed, "dd/MM/yyyy", { locale: ptBR });
  }

  return value || "Data não informada";
}

function getInspectionStatusColor(status: Inspection["status"]) {
  if (status === "approved") return "bg-green-100 text-green-700";
  if (status === "completed") return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
}

function getTrainingModalityColor(modality?: Training["modality"]) {
  if (modality === "presencial") return "bg-blue-100 text-blue-700";
  if (modality === "ead") return "bg-purple-100 text-purple-700";
  return "bg-teal-100 text-teal-700";
}

export const Content = () => {
  const { data: ambientes = [], isLoading: loadingAmbientes } =
    useEnvironments();
  const { data: colaboradores = [], isLoading: loadingColaboradores } =
    useEmployees();
  const { data: inspecoes = [], isLoading: loadingInspecoes } =
    useInspections();
  const { data: treinamentos = [], isLoading: loadingTreinamentos } =
    useTrainings();
  const { data: epis = [], isLoading: loadingEpis } = useEPIs();

  const isLoadingStats =
    loadingAmbientes ||
    loadingColaboradores ||
    loadingInspecoes ||
    loadingTreinamentos ||
    loadingEpis;

  const totalEPIs = epis.reduce((acc, epi) => acc + (epi.quantity || 0), 0);
  const ambientesAtivos = ambientes.filter(
    (ambiente) => ambiente.status === "active",
  ).length;
  const colaboradoresAtivos = colaboradores.filter(
    (colaborador) => colaborador.status === "active",
  ).length;
  const inspecoesConcluidas = inspecoes.filter(
    (inspecao) =>
      inspecao.status === "completed" || inspecao.status === "approved",
  ).length;

  const ultimasInspecoes = [...inspecoes]
    .sort((a, b) => {
      const aTime = toDate(a.inspection_date)?.getTime() || 0;
      const bTime = toDate(b.inspection_date)?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  const proximosTreinamentos = [...treinamentos]
    .filter((treinamento) => treinamento.status !== "completed")
    .sort((a, b) => {
      const aTime = toDate(a.eventDate)?.getTime() || Number.MAX_SAFE_INTEGER;
      const bTime = toDate(b.eventDate)?.getTime() || Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
    .slice(0, 5);

  const stats = [
    {
      title: "Ambientes Ativos",
      value: ambientesAtivos,
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      link: "cadastros/ambientes",
    },
    {
      title: "Colaboradores",
      value: colaboradoresAtivos,
      icon: Users,
      color: "from-amber-500 to-amber-600",
      link: "cadastros/colaboradores",
    },
    {
      title: "Inspeções",
      value: inspecoes.length,
      icon: ClipboardCheck,
      color: "from-emerald-500 to-emerald-600",
      link: "inspecao/inspecoes",
    },
    {
      title: "Treinamentos",
      value: treinamentos.length,
      icon: GraduationCap,
      color: "from-purple-500 to-purple-600",
      link: "treinamento/turmas",
    },
    {
      title: "EPIs em Estoque",
      value: totalEPIs,
      icon: HardHat,
      color: "from-rose-500 to-rose-600",
      link: "controledeepi/estoques",
    },
    {
      title: "Inspeções Concluídas",
      value: inspecoesConcluidas,
      icon: CheckCircle2,
      color: "from-teal-500 to-teal-600",
      link: "inspecao/relatorios",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="mt-1 text-slate-500">
            Bem-vindo ao Sistema de Gestão de Segurança
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
          <Calendar className="h-4 w-4" />
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoadingStats
          ? Array.from({ length: 6 }).map((_, index) => (
              <Card key={`stats-skeleton-${index}`} className="border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                    <Skeleton className="h-14 w-14 rounded-2xl" />
                  </div>
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Link key={stat.title} href={createPageUrl(stat.link)}>
                <Card className="group overflow-hidden border-0 transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {stat.title}
                        </p>
                        <p className="mt-2 text-4xl font-bold text-slate-800">
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 shadow-lg transition-transform group-hover:scale-110`}
                      >
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              Módulo de Inspeção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-500">
              Gerencie inspeções em obras com fotos, NRs e relatórios de
              conformidade.
            </p>
            <div className="flex gap-2">
              <Link
                href={createPageUrl("cadastros/ambientes")}
                className="flex-1 rounded-lg bg-blue-50 px-4 py-2 text-center text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
              >
                Ambientes
              </Link>
              <Link
                href={createPageUrl("inspecao/inspecoes")}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Nova Inspeção
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              Módulo de Treinamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-500">
              Crie treinamentos, certificados e ATAs conforme NR-01.
            </p>
            <div className="flex gap-2">
              <Link
                href={createPageUrl("treinamento/modelos")}
                className="flex-1 rounded-lg bg-purple-50 px-4 py-2 text-center text-sm font-medium text-purple-600 transition-colors hover:bg-purple-100"
              >
                Modelos
              </Link>
              <Link
                href={createPageUrl("treinamento/turmas")}
                className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-purple-700"
              >
                Novo Treinamento
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HardHat className="h-5 w-5 text-amber-600" />
              Controle de EPI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-500">
              Controle estoques, transferências e entregas de EPIs com
              assinatura digital.
            </p>
            <div className="flex gap-2">
              <Link
                href={createPageUrl("controledeepi/estoques")}
                className="flex-1 rounded-lg bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-600 transition-colors hover:bg-amber-100"
              >
                Estoques
              </Link>
              <Link
                href={createPageUrl("controledeepi/entregas")}
                className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                Nova Entrega
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Últimas Inspeções</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingInspecoes ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`inspection-skeleton-${index}`}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : ultimasInspecoes.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhuma inspeção cadastrada
              </p>
            ) : (
              <div className="space-y-3">
                {ultimasInspecoes.map((inspecao) => (
                  <div
                    key={inspecao.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-700">
                        {inspecao.environment_name ||
                          "Ambiente não identificado"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatDate(inspecao.inspection_date)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getInspectionStatusColor(
                        inspecao.status,
                      )}`}
                    >
                      {inspectionStatusLabel[inspecao.status] || "Pendente"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Próximos Treinamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTreinamentos ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`training-skeleton-${index}`}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            ) : proximosTreinamentos.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhum treinamento cadastrado
              </p>
            ) : (
              <div className="space-y-3">
                {proximosTreinamentos.map((treinamento) => (
                  <div
                    key={treinamento.id || treinamento.title}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-700">
                        {treinamento.title || "Treinamento sem título"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {treinamento.standard || "Norma não informada"} •{" "}
                        {formatDate(treinamento.eventDate)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getTrainingModalityColor(
                        treinamento.modality,
                      )}`}
                    >
                      {trainingModalityLabel[treinamento.modality || ""] ||
                        "NÃO INFORMADA"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

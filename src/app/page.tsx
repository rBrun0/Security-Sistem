import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function Home() {
  // const { data: ambientes = [] } = useQuery({
  //   queryKey: ['ambientes'],
  //   queryFn: () => base44.entities.Ambiente.list()
  // });

  const ambientes = [
    { id: 1, nome: "Obra A", status: "ativo" },
    { id: 2, nome: "Obra B", status: "inativo" },
    { id: 3, nome: "Obra C", status: "ativo" },
  ];

  // const { data: colaboradores = [] } = useQuery({
  //   queryKey: ["colaboradores"],
  //   queryFn: () => base44.entities.Colaborador.list(),
  // });

  const colaboradores = [];

  // const { data: inspecoes = [] } = useQuery({
  //   queryKey: ["inspecoes"],
  //   queryFn: () => base44.entities.Inspecao.list(),
  // });

  const inspecoes = [];

  // const { data: treinamentos = [] } = useQuery({
  //   queryKey: ["treinamentos"],
  //   queryFn: () => base44.entities.Treinamento.list(),
  // });

  const treinamentos = [];

  // const { data: epis = [] } = useQuery({
  //   queryKey: ["epis"],
  //   queryFn: () => base44.entities.EPI.list(),
  // });

  const epis = [];

  const totalEPIs = epis.reduce((acc, epi) => acc + (epi.quantidade || 0), 0);
  const inspecoesConcluidas = inspecoes.filter(
    (i) => i.status === "concluida",
  ).length;
  const treinamentosAgendados = treinamentos.filter(
    (t) => t.status === "agendado",
  ).length;

  const stats = [
    {
      title: "Ambientes Ativos",
      value: ambientes.filter((a) => a.status === "ativo").length,
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      link: "Ambientes",
    },
    {
      title: "Colaboradores",
      value: colaboradores.filter((c) => c.status === "ativo").length,
      icon: Users,
      color: "from-amber-500 to-amber-600",
      link: "Colaboradores",
    },
    {
      title: "Inspeções",
      value: inspecoes.length,
      icon: ClipboardCheck,
      color: "from-emerald-500 to-emerald-600",
      link: "Inspecoes",
    },
    {
      title: "Treinamentos",
      value: treinamentos.length,
      icon: GraduationCap,
      color: "from-purple-500 to-purple-600",
      link: "Treinamentos",
    },
    {
      title: "EPIs em Estoque",
      value: totalEPIs,
      icon: HardHat,
      color: "from-rose-500 to-rose-600",
      link: "EPIs",
    },
    {
      title: "Inspeções Concluídas",
      value: inspecoesConcluidas,
      icon: CheckCircle2,
      color: "from-teal-500 to-teal-600",
      link: "RelatoriosInspecao",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Bem-vindo ao Sistema de Gestão de Segurança
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm">
          <Calendar className="w-4 h-4" />
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} href={createPageUrl(stat.link)}>
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <p className="text-4xl font-bold text-slate-800 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
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
                href={createPageUrl("Ambientes")}
                className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors text-center"
              >
                Ambientes
              </Link>
              <Link
                href={createPageUrl("inspecao/inspecoes")}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Nova Inspeção
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
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
                className="flex-1 py-2 px-4 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors text-center"
              >
                Modelos
              </Link>
              <Link
                href={createPageUrl("treinamento/turmas")}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors text-center"
              >
                Novo Treinamento
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-600" />
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
                className="flex-1 py-2 px-4 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors text-center"
              >
                Estoques
              </Link>
              <Link
                href={createPageUrl("controledeepi/entregas")}
                className="flex-1 py-2 px-4 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors text-center"
              >
                Nova Entrega
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Últimas Inspeções</CardTitle>
          </CardHeader>
          <CardContent>
            {inspecoes.length === 0 ? (
              <p className="text-slate-500 text-sm">
                Nenhuma inspeção cadastrada
              </p>
            ) : (
              <div className="space-y-3">
                {inspecoes.slice(0, 5).map((inspecao) => (
                  <div
                    key={inspecao.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-700">
                        {inspecao.obra_nome || "Obra não identificada"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {inspecao.data_inspecao}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        inspecao.status === "concluida"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {inspecao.status === "concluida"
                        ? "Concluída"
                        : "Em Andamento"}
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
            {treinamentos.length === 0 ? (
              <p className="text-slate-500 text-sm">
                Nenhum treinamento cadastrado
              </p>
            ) : (
              <div className="space-y-3">
                {treinamentos
                  .filter((t) => t.status !== "concluido")
                  .slice(0, 5)
                  .map((treinamento) => (
                    <div
                      key={treinamento.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-700">
                          {treinamento.titulo}
                        </p>
                        <p className="text-sm text-slate-500">
                          {treinamento.norma} • {treinamento.data_realizacao}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          treinamento.modalidade === "presencial"
                            ? "bg-blue-100 text-blue-700"
                            : treinamento.modalidade === "ead"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-teal-100 text-teal-700"
                        }`}
                      >
                        {treinamento.modalidade?.toUpperCase()}
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
}

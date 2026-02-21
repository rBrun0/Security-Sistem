"use client";

import React, { Suspense, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Award,
  Printer,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Loader2,
} from "lucide-react";
import { createPageUrl } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTrainings, useTraining } from "@/src/app/modules/trainings/hooks";
import { useTrainingParticipants } from "@/src/app/modules/training-participants/hooks";
import { useInstructors } from "@/src/app/modules/instructors/hooks";
import { useTechnicalResponsibles } from "@/src/app/modules/responsaveistecnicos/hooks";

function CertificadosContent() {
  const searchParams = useSearchParams();
  const treinamentoIdParam = searchParams.get("treinamento_id") || "";
  const [selectedTreinamento, setSelectedTreinamento] = useState("");
  const [selectedParticipante, setSelectedParticipante] = useState("");
  const [viewMode, setViewMode] = useState("certificado");

  console.log("Treinamento ID do parâmetro:", treinamentoIdParam);

  const currentTreinamentoId = selectedTreinamento || treinamentoIdParam;

  const { data: treinamentos = [], isLoading: loadingTrainings } =
    useTrainings();
  const { data: treinamento, isLoading: loadingTreinamento } = useTraining(
    currentTreinamentoId || undefined,
  );
  const { data: participantes = [], isLoading: loadingParticipantes } =
    useTrainingParticipants(currentTreinamentoId || undefined);
  const { data: instrutores = [] } = useInstructors();
  const { data: responsaveis = [] } = useTechnicalResponsibles();

  const instrutor = useMemo(
    () => instrutores.find((i) => i.id === treinamento?.instructorId),
    [instrutores, treinamento?.instructorId],
  );

  const responsavel = useMemo(
    () =>
      responsaveis.find((r) => r.id === treinamento?.technicalResponsibleId),
    [responsaveis, treinamento?.technicalResponsibleId],
  );

  const participante = participantes.find((p) => p.id === selectedParticipante);

  const getSignatureUrl = (item?: Record<string, unknown> | null) => {
    if (!item) return "";

    const signature =
      item.signatureUrl || item.signature_url || item.assinatura_url;
    return typeof signature === "string" ? signature : "";
  };

  const isLoadingPreview =
    Boolean(currentTreinamentoId) &&
    (loadingTreinamento || loadingParticipantes);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%;
            }
            .no-print { display: none !important; }
            @page { size: A4 landscape; margin: 10mm; }
          }
        `}
      </style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Link
            href={createPageUrl(`treinamento/turmas/${treinamentoIdParam}`)}
            passHref
          >
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Certificados e ATA
            </h1>
            <p className="text-slate-500 mt-1">
              Gere certificados e atas de treinamento
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md no-print">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Treinamento
              </label>
              <Select
                value={currentTreinamentoId}
                onValueChange={(v) => {
                  setSelectedTreinamento(v);
                  setSelectedParticipante("");
                }}
                disabled={loadingTrainings}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {treinamentos.map((t) => (
                    <SelectItem key={t.id} value={t.id as string}>
                      {t.title || "Treinamento sem título"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Participante
              </label>
              <Select
                value={selectedParticipante}
                onValueChange={(value) => {
                  setSelectedParticipante(value);
                  if (value === "todos") {
                    setViewMode("ata");
                  }
                }}
                disabled={!currentTreinamentoId}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos (ATA)</SelectItem>
                  {participantes.map((p) => (
                    <SelectItem key={p.id} value={p.id as string}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Visualizar
              </label>
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificado">Certificado</SelectItem>
                  <SelectItem value="ata">ATA de Presença</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handlePrint}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={!currentTreinamentoId || isLoadingPreview}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {isLoadingPreview && (
        <Card className="border-0 shadow-md">
          <CardContent className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Carregando dados do treinamento...
          </CardContent>
        </Card>
      )}

      {currentTreinamentoId && treinamento && !isLoadingPreview && (
        <div className="print-area">
          {viewMode === "certificado" && participante ? (
            // CERTIFICADO
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              {/* Frente do Certificado */}
              <div className="p-8 min-h-[600px] border-8 border-double border-purple-200 m-4 relative">
                <div className="absolute top-4 right-4">
                  <Award className="w-16 h-16 text-purple-200" />
                </div>

                <div className="text-center space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold text-purple-800 tracking-wide">
                      CERTIFICADO
                    </h1>
                    <div className="w-32 h-1 bg-purple-600 mx-auto mt-2" />
                  </div>

                  <p className="text-lg text-slate-600 mt-8">
                    Certificamos que
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 border-b-2 border-purple-200 pb-2 inline-block">
                    {participante.name}
                  </h2>

                  {participante.company && (
                    <p className="text-slate-600">
                      da empresa <strong>{participante.company}</strong>
                    </p>
                  )}

                  <p className="text-lg text-slate-600">
                    participou e concluiu com aproveitamento o treinamento
                  </p>

                  <h3 className="text-2xl font-bold text-purple-700">
                    {treinamento.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mt-8 text-left max-w-lg mx-auto">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span>
                        <strong>Data:</strong> {treinamento.eventDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>
                        <strong>Carga Horária:</strong> {treinamento.workload}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <span>
                        <strong>Local:</strong>{" "}
                        {treinamento.location || "Não especificado"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-12 pt-8">
                    <div className="text-center">
                      <div className="border-t-2 border-slate-400 pt-2 mt-12">
                        {getSignatureUrl(
                          participante as Record<string, unknown>,
                        ) ? (
                          <img
                            src={getSignatureUrl(
                              participante as Record<string, unknown>,
                            )}
                            alt="Assinatura"
                            className="h-12 mx-auto mb-2"
                          />
                        ) : (
                          <div className="h-12" />
                        )}
                        <p className="font-medium">{participante.name}</p>
                        <p className="text-sm text-slate-500">Participante</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="border-t-2 border-slate-400 pt-2 mt-12">
                        {getSignatureUrl(
                          instrutor as unknown as Record<string, unknown>,
                        ) ? (
                          <img
                            src={getSignatureUrl(
                              instrutor as unknown as Record<string, unknown>,
                            )}
                            alt="Assinatura"
                            className="h-12 mx-auto mb-2"
                          />
                        ) : (
                          <div className="h-12" />
                        )}
                        <p className="font-medium">
                          {instrutor?.name || "Instrutor"}
                        </p>
                        <p className="text-sm text-slate-500">Instrutor</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verso do Certificado */}
              <div className="p-8 min-h-[600px] border-8 border-double border-purple-200 m-4 mt-8 page-break-before">
                <h2 className="text-2xl font-bold text-purple-800 text-center mb-6">
                  CONTEÚDO PROGRAMÁTICO
                </h2>

                <div className="bg-slate-50 p-6 rounded-lg mb-6">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700">
                    {treinamento.programContent}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-8">
                  <div>
                    <h3 className="font-bold text-lg text-purple-800 mb-3">
                      Instrutor
                    </h3>
                    <p className="font-medium">{instrutor?.name}</p>
                    <p className="text-sm text-slate-600">
                      {instrutor?.qualifications}
                    </p>
                    {instrutor?.professionalRegistrations?.map((reg, i) => (
                      <p key={i} className="text-sm text-slate-500">
                        {reg.type}: {reg.number}
                      </p>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-purple-800 mb-3">
                      Responsável Técnico
                    </h3>
                    <p className="font-medium">{responsavel?.name}</p>
                    <p className="text-sm text-slate-600">
                      {responsavel?.qualifications}
                    </p>
                    {responsavel?.professionalRegistrations?.map((reg, i) => (
                      <p key={i} className="text-sm text-slate-500">
                        {reg.type}: {reg.number}
                      </p>
                    ))}
                    {getSignatureUrl(
                      responsavel as unknown as Record<string, unknown>,
                    ) && (
                      <img
                        src={getSignatureUrl(
                          responsavel as unknown as Record<string, unknown>,
                        )}
                        alt="Assinatura"
                        className="h-12 mt-4"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : viewMode === "ata" ? (
            // ATA DE PRESENÇA
            <div className="bg-white shadow-lg rounded-lg overflow-hidden p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-purple-800">
                  ATA DE PRESENÇA
                </h1>
                <div className="w-24 h-1 bg-purple-600 mx-auto mt-2" />
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  {treinamento.title}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p>
                    <strong>Norma:</strong> {treinamento.standard}
                  </p>
                  <p>
                    <strong>Modalidade:</strong>{" "}
                    {treinamento.modality?.toUpperCase()}
                  </p>
                  <p>
                    <strong>Data:</strong> {treinamento.eventDate}
                  </p>
                  <p>
                    <strong>Carga Horária:</strong> {treinamento.workload}
                  </p>
                  <p className="col-span-2">
                    <strong>Local:</strong> {treinamento.location}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  CONTEÚDO PROGRAMÁTICO
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg text-sm">
                  <pre className="whitespace-pre-wrap">
                    {treinamento.programContent}
                  </pre>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  PARTICIPANTES
                </h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border p-2 text-left">Nº</th>
                      <th className="border p-2 text-left">Nome</th>
                      <th className="border p-2 text-left">CPF</th>
                      <th className="border p-2 text-left">Empresa</th>
                      <th className="border p-2 text-center">Assinatura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantes.map((p, i) => (
                      <tr key={p.id}>
                        <td className="border p-2">{i + 1}</td>
                        <td className="border p-2">{p.name}</td>
                        <td className="border p-2">{p.cpf}</td>
                        <td className="border p-2">{p.company}</td>
                        <td className="border p-2 h-16">
                          {getSignatureUrl(p as Record<string, unknown>) ? (
                            <img
                              src={getSignatureUrl(
                                p as Record<string, unknown>,
                              )}
                              alt="Assinatura"
                              className="h-10 mx-auto"
                            />
                          ) : p.signed ? (
                            <span className="text-xs text-slate-500">
                              Assinado
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t">
                <div className="text-center">
                  <div className="border-t-2 border-slate-400 pt-2 mt-16">
                    {getSignatureUrl(
                      instrutor as unknown as Record<string, unknown>,
                    ) && (
                      <img
                        src={getSignatureUrl(
                          instrutor as unknown as Record<string, unknown>,
                        )}
                        alt="Assinatura"
                        className="h-12 mx-auto mb-2"
                      />
                    )}
                    <p className="font-medium">{instrutor?.name}</p>
                    <p className="text-sm text-slate-500">Instrutor</p>
                    {instrutor?.professionalRegistrations?.map((reg, i) => (
                      <p key={i} className="text-xs text-slate-400">
                        {reg.type}: {reg.number}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-slate-400 pt-2 mt-16">
                    {getSignatureUrl(
                      responsavel as unknown as Record<string, unknown>,
                    ) && (
                      <img
                        src={getSignatureUrl(
                          responsavel as unknown as Record<string, unknown>,
                        )}
                        alt="Assinatura"
                        className="h-12 mx-auto mb-2"
                      />
                    )}
                    <p className="font-medium">{responsavel?.name}</p>
                    <p className="text-sm text-slate-500">
                      Responsável Técnico
                    </p>
                    {responsavel?.professionalRegistrations?.map((reg, i) => (
                      <p key={i} className="text-xs text-slate-400">
                        {reg.type}: {reg.number}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500">
                  Selecione um participante para gerar o certificado
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!currentTreinamentoId && (
        <Card className="border-dashed no-print">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500">
              Selecione um treinamento para começar
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CertificadosPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <p className="text-slate-500">Carregando certificados...</p>
        </div>
      }
    >
      <CertificadosContent />
    </Suspense>
  );
}

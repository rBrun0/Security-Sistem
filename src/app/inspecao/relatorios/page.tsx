"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Calendar, Printer } from "lucide-react";
import { format } from "date-fns";
import { useEnvironments } from "../../modules/enviroments/hooks";
import { useInspections } from "../../modules/inspections/hooks";

export default function RelatoriosInspecaoPage() {
  const [filterObra, setFilterObra] = useState("todas");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedInspecao, setSelectedInspecao] = useState(null);

  const { data: environments = [] } = useEnvironments();

  const { data: inspections = [], isLoading } = useInspections();

  const { data: itensInspecao = [] } = useQuery({
    queryKey: ["itens-inspecao-all"],
    queryFn: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            // Mock data for itensInspecao
            {
              id: "1",
              inspecao_id: "1",
              nr: "NR-01",
              descricao: "Item 1",
              conforme: true,
              observacao: "OK",
            },
            {
              id: "2",
              inspecao_id: "1",
              nr: "NR-02",
              descricao: "Item 2",
              conforme: false,
              observacao: "Needs attention",
            },
            {
              id: "3",
              inspecao_id: "2",
              nr: "NR-03",
              descricao: "Item 3",
              conforme: true,
              observacao: "",
            },
          ]);
        }, 500);
      }),
  });

  const filteredInspections = inspections.filter((inspection) => {
    const matchObra =
      filterObra === "todas" || inspection.environment_id === filterObra;
    // || inspection.ambiente_id === filterObra;
    const matchDateFrom = !dateFrom || inspection.inspection_date >= dateFrom;
    const matchDateTo = !dateTo || inspection.inspection_date <= dateTo;
    return matchObra && matchDateFrom && matchDateTo;
  });

  const getItensForInspecao = (inspectionId: string) => {
    return (itensInspecao as { inspecao_id: string }[]).filter(
      (item) => item.inspecao_id === inspectionId,
    );
  };

  const handlePrint = (inspecao: unknown) => {
    setSelectedInspecao(inspecao as null);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const exportToCSV = () => {
    const headers = [
      "Obra",
      "Data",
      "Total Itens",
      "Conformes",
      "Não Conformes",
      "% Conformidade",
    ];
    const rows = filteredInspections.map((i) => [
      // i.obra_nome,
      // i.inspection_date,
      // i.total_itens,
      // i.itens_conformes,
      // i.itens_nao_conformes,
      // `${i.percentual_conformidade?.toFixed(1)}%`,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_inspecoes_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Print styles */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-content, .print-content * { visibility: visible; }
            .print-content { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%;
              padding: 20px;
            }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Relatórios de Inspeção
          </h1>
          <p className="text-slate-500 mt-1">
            Visualize e exporte relatórios das inspeções concluídas
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md no-print">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Ambiente</Label>
              <Select value={filterObra} onValueChange={setFilterObra}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos os Ambientes</SelectItem>
                  {environments.map((environment) => (
                    <SelectItem key={environment.id} value={environment.id}>
                      {environment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>Data Final</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFilterObra("todas");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredInspections.length === 0 ? (
        <Card className="border-dashed no-print">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500">
              Nenhuma inspeção concluída encontrada
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 no-print">
          {filteredInspections.map((inspection) => {
            const itens = getItensForInspecao(inspection.id);
            // const naoConformes = itens.filter(
            //   (i: { conforme: boolean }) => !i.conforme,
            // );

            const naoConformes = [
              {
                id: "2",
                inspecao_id: "1",
                nr: "NR-02",
              },
            ];

            return (
              <Card
                key={inspection.id}
                className="border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800">
                          {/* {inspecao.obra_nome} */}
                          {inspection.environment_name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {inspection.inspection_date}
                          </span>
                          {/* <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {inspection.itens_conformes} conformes
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            {inspection.itens_nao_conformes} não conformes
                          </span> */}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Conformidade</p>
                        <p
                        // className={`text-2xl font-bold ${
                        //   inspection.percentual_conformidade >= 80
                        //     ? "text-green-600"
                        //     : inspection.percentual_conformidade >= 50
                        //       ? "text-amber-600"
                        //       : "text-red-600"
                        // }`}
                        >
                          {/* {inspection.percentual_conformidade?.toFixed(0)}% */}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(inspection)}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir
                      </Button>
                    </div>
                  </div>

                  {/* Non-conformities summary */}
                  {naoConformes.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Irregularidades Encontradas:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {/* {naoConformes.map((item) => (
                          <Badge
                            key={item.id}
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            {item.nr}: {item.descricao?.substring(0, 30)}...
                          </Badge>
                        ))} */}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Print Content */}
      {selectedInspecao && (
        <div className="print-content hidden print:block">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">
              RELATÓRIO DE INSPEÇÃO DE SEGURANÇA
            </h1>
            {/* <p className="text-slate-600">{selectedInspecao.obra_nome}</p> */}
            <p className="text-slate-500">
              {/* Data: {selectedInspecao.data_inspecao} */}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="border p-4 text-center">
              <p className="text-sm text-slate-500">Total de Itens</p>
              <p className="text-2xl font-bold">
                {/* {selectedInspecao.total_itens} */}
              </p>
            </div>
            <div className="border p-4 text-center">
              <p className="text-sm text-slate-500">Conformes</p>
              <p className="text-2xl font-bold text-green-600">
                {/* {selectedInspecao.itens_conformes} */}
              </p>
            </div>
            <div className="border p-4 text-center">
              <p className="text-sm text-slate-500">Não Conformes</p>
              <p className="text-2xl font-bold text-red-600">
                {/* {selectedInspecao.itens_nao_conformes} */}
              </p>
            </div>
            <div className="border p-4 text-center">
              <p className="text-sm text-slate-500">% Conformidade</p>
              <p className="text-2xl font-bold">
                {/* {selectedInspecao.percentual_conformidade?.toFixed(1)}% */}
              </p>
            </div>
          </div>

          <h2 className="text-lg font-bold mb-4">Itens Inspecionados:</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-2 text-left">NR</th>
                <th className="border p-2 text-left">Descrição</th>
                <th className="border p-2 text-center">Status</th>
                <th className="border p-2 text-left">Observação</th>
              </tr>
            </thead>
            <tbody>
              {/* {getItensForInspecao(selectedInspecao.id).map((item) => (
                <tr key={item.id}>
                  <td className="border p-2">{item.nr}</td>
                  <td className="border p-2">{item.descricao}</td>
                  <td className="border p-2 text-center">
                    {item.conforme ? "✓ Conforme" : "✗ Não Conforme"}
                  </td>
                  <td className="border p-2">{item.observacao || "-"}</td>
                </tr>
              ))} */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

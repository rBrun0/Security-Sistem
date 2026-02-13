"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Calendar,
  Package,
  ArrowRightLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

export default function RelatoriosEPI() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstoque, setFilterEstoque] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: movimentacoes = [], isLoading } = useQuery({
    queryKey: ["movimentacoes"],
    queryFn: () => base44.entities.MovimentacaoEPI.list("-data_movimentacao"),
  });

  const { data: estoques = [] } = useQuery({
    queryKey: ["estoques"],
    queryFn: () => base44.entities.EstoqueCentral.list(),
  });

  const { data: epis = [] } = useQuery({
    queryKey: ["epis"],
    queryFn: () => base44.entities.EPI.list(),
  });

  const toggleEstoque = (estoqueId) => {
    setFilterEstoque((prev) =>
      prev.includes(estoqueId)
        ? prev.filter((id) => id !== estoqueId)
        : [...prev, estoqueId],
    );
  };

  const filteredMovimentacoes = movimentacoes.filter((mov) => {
    const matchDateFrom = !dateFrom || mov.data_movimentacao >= dateFrom;
    const matchDateTo = !dateTo || mov.data_movimentacao <= dateTo;
    const matchTipo = filterTipo === "todos" || mov.tipo === filterTipo;
    const matchEstoque =
      filterEstoque.length === 0 ||
      filterEstoque.includes(mov.estoque_origem_id) ||
      filterEstoque.includes(mov.estoque_destino_id);
    return matchDateFrom && matchDateTo && matchTipo && matchEstoque;
  });

  const totalEntradas = filteredMovimentacoes
    .filter((m) => m.tipo === "entrada")
    .reduce((acc, m) => acc + (m.valor_total || 0), 0);
  const totalSaidas = filteredMovimentacoes
    .filter((m) => m.tipo === "saida")
    .reduce((acc, m) => acc + (m.valor_total || 0), 0);
  const totalTransferencias = filteredMovimentacoes.filter(
    (m) => m.tipo === "transferencia",
  ).length;

  const exportToCSV = () => {
    const headers = [
      "Data",
      "Tipo",
      "EPI",
      "Quantidade",
      "Valor Unit.",
      "Valor Total",
      "Origem",
      "Destino",
      "Observação",
    ];
    const rows = filteredMovimentacoes.map((m) => [
      m.data_movimentacao,
      m.tipo,
      m.epi_nome,
      m.quantidade,
      m.valor_unitario?.toFixed(2) || "0.00",
      m.valor_total?.toFixed(2) || "0.00",
      m.estoque_origem_nome || m.obra_destino_nome || "-",
      m.estoque_destino_nome || "-",
      m.observacao || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_movimentacoes_epi_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const tipoColors = {
    entrada: "bg-green-100 text-green-700",
    saida: "bg-red-100 text-red-700",
    transferencia: "bg-blue-100 text-blue-700",
  };

  const tipoIcons = {
    entrada: ArrowDownCircle,
    saida: ArrowUpCircle,
    transferencia: ArrowRightLeft,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Relatórios de EPI
          </h1>
          <p className="text-slate-500 mt-1">
            Visualize e exporte relatórios de movimentações
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button
            onClick={exportToCSV}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div>
                <Label>Tipo</Label>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setFilterTipo("todos");
                    setFilterEstoque([]);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <Label className="mb-2 block">Estoques</Label>
              <div className="flex flex-wrap gap-3">
                {estoques.map((estoque) => (
                  <div key={estoque.id} className="flex items-center gap-2">
                    <Checkbox
                      id={estoque.id}
                      checked={filterEstoque.includes(estoque.id)}
                      onCheckedChange={() => toggleEstoque(estoque.id)}
                    />
                    <label
                      htmlFor={estoque.id}
                      className="text-sm cursor-pointer"
                    >
                      {estoque.nome}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Movimentações</p>
                <p className="text-2xl font-bold text-slate-800">
                  {filteredMovimentacoes.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ArrowDownCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalEntradas.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalSaidas.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Transferências</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalTransferencias}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Movimentações</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 font-medium text-slate-600">
                  Data
                </th>
                <th className="text-left p-4 font-medium text-slate-600">
                  Tipo
                </th>
                <th className="text-left p-4 font-medium text-slate-600">
                  EPI
                </th>
                <th className="text-center p-4 font-medium text-slate-600">
                  Qtd
                </th>
                <th className="text-right p-4 font-medium text-slate-600">
                  Valor Unit.
                </th>
                <th className="text-right p-4 font-medium text-slate-600">
                  Total
                </th>
                <th className="text-left p-4 font-medium text-slate-600">
                  Origem/Destino
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredMovimentacoes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-500">
                    Nenhuma movimentação encontrada
                  </td>
                </tr>
              ) : (
                filteredMovimentacoes.map((mov) => {
                  const TipoIcon = tipoIcons[mov.tipo];
                  return (
                    <tr key={mov.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {mov.data_movimentacao}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={tipoColors[mov.tipo]}>
                          <TipoIcon className="w-3 h-3 mr-1" />
                          {mov.tipo === "entrada"
                            ? "Entrada"
                            : mov.tipo === "saida"
                              ? "Saída"
                              : "Transferência"}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium">{mov.epi_nome}</td>
                      <td className="p-4 text-center">{mov.quantidade}</td>
                      <td className="p-4 text-right">
                        R$ {(mov.valor_unitario || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-medium">
                        R$ {(mov.valor_total || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        {mov.estoque_origem_nome && (
                          <span className="text-sm">
                            De: {mov.estoque_origem_nome}
                          </span>
                        )}
                        {(mov.estoque_destino_nome ||
                          mov.obra_destino_nome) && (
                          <span className="text-sm block">
                            Para:{" "}
                            {mov.estoque_destino_nome || mov.obra_destino_nome}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stock Summary */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Resumo por Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estoques.map((estoque) => {
              const estoqueEpis = epis.filter(
                (e) => e.estoque_central_id === estoque.id,
              );
              const totalQtd = estoqueEpis.reduce(
                (acc, e) => acc + (e.quantidade || 0),
                0,
              );
              const totalValor = estoqueEpis.reduce(
                (acc, e) => acc + (e.quantidade || 0) * (e.valor_unitario || 0),
                0,
              );

              return (
                <div key={estoque.id} className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800">
                    {estoque.nome}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p>Tipos de EPI: {estoqueEpis.length}</p>
                    <p>Quantidade Total: {totalQtd} unidades</p>
                    <p className="font-medium">
                      Valor Total: R$ {totalValor.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
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
  Download,
  Calendar,
  Package,
  ArrowRightLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { useEPIMovements } from "@/src/app/modules/epi-movements/hooks";
import { useCentralWarehouses } from "@/src/app/modules/central-warehouses/hooks";
import { useEPIs } from "@/src/app/modules/epis/hooks";

export default function RelatoriosEPI() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [filterWarehouse, setFilterWarehouse] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: movements = [], isLoading } = useEPIMovements();
  const { data: warehouses = [] } = useCentralWarehouses();
  const { data: epis = [] } = useEPIs();

  const toggleWarehouse = (warehouseId: string) => {
    setFilterWarehouse((prev) =>
      prev.includes(warehouseId)
        ? prev.filter((id) => id !== warehouseId)
        : [...prev, warehouseId],
    );
  };

  const filteredMovements = useMemo(
    () =>
      movements.filter((movement) => {
        const date = movement.movementDate || "";
        const matchDateFrom = !dateFrom || date >= dateFrom;
        const matchDateTo = !dateTo || date <= dateTo;
        const matchType =
          filterType === "todos" || movement.type === filterType;
        const matchWarehouse =
          filterWarehouse.length === 0 ||
          filterWarehouse.includes(movement.originWarehouseId || "") ||
          filterWarehouse.includes(movement.destinationWarehouseId || "");

        return matchDateFrom && matchDateTo && matchType && matchWarehouse;
      }),
    [dateFrom, dateTo, filterType, filterWarehouse, movements],
  );

  const totalEntries = filteredMovements
    .filter((movement) => movement.type === "entrada")
    .reduce((acc, movement) => acc + (movement.totalValue || 0), 0);

  const totalExits = filteredMovements
    .filter((movement) => movement.type === "saida")
    .reduce((acc, movement) => acc + (movement.totalValue || 0), 0);

  const totalTransfers = filteredMovements.filter(
    (movement) => movement.type === "transferencia",
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

    const rows = filteredMovements.map((movement) => [
      movement.movementDate,
      movement.type,
      movement.epiName,
      movement.quantity,
      movement.unitValue?.toFixed(2) || "0.00",
      movement.totalValue?.toFixed(2) || "0.00",
      movement.originWarehouseName ||
        movement.destinationEnvironmentName ||
        "-",
      movement.destinationWarehouseName || "-",
      movement.observation || "",
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

  const typeColors: Record<string, string> = {
    entrada: "bg-green-100 text-green-700",
    saida: "bg-red-100 text-red-700",
    transferencia: "bg-blue-100 text-blue-700",
  };

  const typeIcons = {
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
                <Select value={filterType} onValueChange={setFilterType}>
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
                    setFilterType("todos");
                    setFilterWarehouse([]);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <Label className="mb-2 block">Estoques</Label>
              <div className="flex flex-wrap gap-3">
                {warehouses.map((warehouse) => (
                  <div key={warehouse.id} className="flex items-center gap-2">
                    <Checkbox
                      id={warehouse.id}
                      checked={filterWarehouse.includes(warehouse.id)}
                      onCheckedChange={() => toggleWarehouse(warehouse.id)}
                    />
                    <label
                      htmlFor={warehouse.id}
                      className="text-sm cursor-pointer"
                    >
                      {warehouse.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  {filteredMovements.length}
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
                  R$ {totalEntries.toFixed(2)}
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
                  R$ {totalExits.toFixed(2)}
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
                  {totalTransfers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <td colSpan={7} className="text-center p-8 text-slate-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-500">
                    Nenhuma movimentação encontrada
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => {
                  const TypeIcon = typeIcons[movement.type];

                  return (
                    <tr
                      key={movement.id}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {movement.movementDate}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={typeColors[movement.type]}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {movement.type === "entrada"
                            ? "Entrada"
                            : movement.type === "saida"
                              ? "Saída"
                              : "Transferência"}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium">{movement.epiName}</td>
                      <td className="p-4 text-center">{movement.quantity}</td>
                      <td className="p-4 text-right">
                        R$ {(movement.unitValue || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-medium">
                        R$ {(movement.totalValue || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        {movement.originWarehouseName && (
                          <span className="text-sm">
                            De: {movement.originWarehouseName}
                          </span>
                        )}
                        {(movement.destinationWarehouseName ||
                          movement.destinationEnvironmentName) && (
                          <span className="text-sm block">
                            Para:{" "}
                            {movement.destinationWarehouseName ||
                              movement.destinationEnvironmentName}
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

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Resumo por Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((warehouse) => {
              const warehouseEpis = epis.filter(
                (epi) => epi.centralWarehouseId === warehouse.id,
              );

              const totalQuantity = warehouseEpis.reduce(
                (acc, epi) => acc + (epi.quantity || 0),
                0,
              );

              const totalValue = warehouseEpis.reduce(
                (acc, epi) => acc + (epi.quantity || 0) * (epi.unitValue || 0),
                0,
              );

              return (
                <div key={warehouse.id} className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800">
                    {warehouse.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p>Tipos de EPI: {warehouseEpis.length}</p>
                    <p>Quantidade Total: {totalQuantity} unidades</p>
                    <p className="font-medium">
                      Valor Total: R$ {totalValue.toFixed(2)}
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

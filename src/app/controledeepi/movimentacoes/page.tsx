"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  Search,
  Calendar,
  Package,
  Building2,
  DollarSign,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormSelect } from "@/src/components/form/form-select";
import { FormInput } from "@/src/components/form/form-input";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Movimentacoes() {
  const [isOpen, setIsOpen] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState("entrada");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");

  const movimentacaoSchema = z.object({
    type: z.enum(["entrada", "saida", "transferencia"]),
    epi_id: z.string().min(1, "EPI é obrigatório"),
    quantity: z.number().min(1, "Quantidade mínima é 1"),
    origin_warehouse_id: z.string().optional(),
    destination_warehouse_id: z.string().optional(),
    destination_environment_id: z.string().optional(),
    movement_date: z.string().optional(),
    observation: z.string().optional(),
  });

  type MovimentacaoFormData = z.infer<typeof movimentacaoSchema>;

  const form = useForm<MovimentacaoFormData>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: {
      type: "entrada",
      epi_id: "",
      quantity: 1,
      origin_warehouse_id: "",
      destination_warehouse_id: "",
      destination_environment_id: "",
      movement_date: new Date().toISOString().split("T")[0],
      observation: "",
    },
  });

  const queryClient = useQueryClient();

  const { data: movimentacoes = [], isLoading } = useQuery({
    queryKey: ["movimentacoes"],
    queryFn: () => base44.entities.MovimentacaoEPI.list("-created_date"),
  });

  const { data: epis = [] } = useQuery({
    queryKey: ["epis"],
    queryFn: () => base44.entities.EPI.list(),
  });

  const { data: estoques = [] } = useQuery({
    queryKey: ["estoques"],
    queryFn: () => base44.entities.EstoqueCentral.list(),
  });

  const { data: ambientes = [] } = useQuery({
    queryKey: ["ambientes"],
    queryFn: () => base44.entities.Ambiente.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Create movimentacao
      const epi = epis.find((e) => e.id === data.epi_id);
      await base44.entities.MovimentacaoEPI.create({
        tipo: data.type,
        epi_id: data.epi_id,
        epi_nome: epi?.nome,
        quantidade: data.quantity,
        valor_unitario: epi?.valor_unitario || 0,
        estoque_origem_id: data.origin_warehouse_id,
        estoque_origem_nome: estoques.find(
          (e) => e.id === data.origin_warehouse_id,
        )?.nome,
        estoque_destino_id: data.destination_warehouse_id,
        estoque_destino_nome: estoques.find(
          (e) => e.id === data.destination_warehouse_id,
        )?.nome,
        obra_destino_id: data.destination_environment_id,
        obra_destino_nome: ambientes.find(
          (a) => a.id === data.destination_environment_id,
        )?.nome,
        data_movimentacao: data.movement_date,
        observacao: data.observation,
        valor_total: (epi?.valor_unitario || 0) * data.quantity,
      });

      // Update EPI quantity
      if (epi) {
        let newQtd = epi.quantidade || 0;
        if (data.type === "entrada") {
          newQtd += data.quantity;
        } else {
          newQtd -= data.quantity;
        }
        await base44.entities.EPI.update(epi.id, {
          quantidade: Math.max(0, newQtd),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimentacoes"] });
      queryClient.invalidateQueries({ queryKey: ["epis"] });
      setIsOpen(false);
      resetForm();
      toast.success("Movimentação registrada com sucesso!");
    },
  });

  const resetForm = () => {
    form.reset({
      type: "entrada",
      epi_id: "",
      quantity: 1,
      origin_warehouse_id: "",
      destination_warehouse_id: "",
      destination_environment_id: "",
      movement_date: new Date().toISOString().split("T")[0],
      observation: "",
    });
    setTipoMovimentacao("entrada");
  };

  const onSubmit = (data: MovimentacaoFormData) => {
    createMutation.mutate({
      ...data,
      type: tipoMovimentacao as "entrada" | "saida" | "transferencia",
    });
  };

  const filteredMovimentacoes = movimentacoes.filter((mov) => {
    const matchSearch = mov.epi_nome
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === "todos" || mov.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

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

  useEffect(() => {
    form.reset({
      epi_id: "",
      quantity: 1,
      movement_date: new Date().toISOString().split("T")[0],
      observation: "",
    });
  }, [tipoMovimentacao]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Movimentações</h1>
          <p className="text-slate-500 mt-1">
            Registre entradas, saídas e transferências de EPIs
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Movimentação</DialogTitle>
            </DialogHeader>

            <Tabs
              value={tipoMovimentacao}
              onValueChange={setTipoMovimentacao}
              className="mt-4"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="entrada"
                  className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  Entrada
                </TabsTrigger>
                <TabsTrigger
                  value="saida"
                  className="flex items-center gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-700"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Saída
                </TabsTrigger>
                <TabsTrigger
                  value="transferencia"
                  className="flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Transferência
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 mt-4"
                >
                  <FormSelect
                    name="epi_id"
                    label="EPI"
                    control={form.control}
                    options={epis.map((epi) => ({
                      label: `${epi.nome} ${epi.ca ? `(CA: ${epi.ca})` : ""}`,
                      value: epi.id,
                    }))}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      name="quantity"
                      label="Quantidade"
                      type="number"
                      control={form.control}
                    />
                  </div>

                  {tipoMovimentacao === "entrada" && (
                    <FormSelect
                      name="destination_warehouse_id"
                      label="Estoque de Destino"
                      control={form.control}
                      options={estoques
                        .filter((e) => e.ativo)
                        .map((est) => ({
                          label: est.nome,
                          value: est.id,
                        }))}
                    />
                  )}

                  {tipoMovimentacao === "saida" && (
                    <>
                      <FormSelect
                        name="origin_warehouse_id"
                        label="Estoque de Origem"
                        control={form.control}
                        options={estoques
                          .filter((e) => e.ativo)
                          .map((est) => ({
                            label: est.nome,
                            value: est.id,
                          }))}
                      />
                      <FormSelect
                        name="destination_environment_id"
                        label="Ambiente de Destino"
                        control={form.control}
                        options={ambientes
                          .filter((a) => a.status === "ativo")
                          .map((ambiente) => ({
                            label: ambiente.nome,
                            value: ambiente.id,
                          }))}
                      />
                    </>
                  )}

                  {tipoMovimentacao === "transferencia" && (
                    <>
                      <FormSelect
                        name="origin_warehouse_id"
                        label="Estoque de Origem"
                        control={form.control}
                        options={estoques
                          .filter((e) => e.ativo)
                          .map((est) => ({
                            label: est.nome,
                            value: est.id,
                          }))}
                      />
                      <FormSelect
                        name="destination_warehouse_id"
                        label="Estoque de Destino"
                        control={form.control}
                        options={estoques
                          .filter((e) => e.ativo)
                          .map((est) => ({
                            label: est.nome,
                            value: est.id,
                          }))}
                      />
                    </>
                  )}

                  <FormDatePicker
                    name="movement_date"
                    label="Data da Movimentação"
                    control={form.control}
                  />

                  <FormTextarea
                    name="observation"
                    label="Observação"
                    control={form.control}
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
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Registrar Movimentação
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por EPI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        {/* <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="saida">Saída</SelectItem>
            <SelectItem value="transferencia">Transferência</SelectItem>
          </SelectContent>
        </Select> */}
      </div>

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
      ) : filteredMovimentacoes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ArrowRightLeft className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhuma movimentação encontrada"
                : "Nenhuma movimentação registrada"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primeira Movimentação
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMovimentacoes.map((mov) => {
            const TipoIcon = tipoIcons[mov.tipo] || ArrowRightLeft;
            return (
              <Card
                key={mov.id}
                className="border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          mov.tipo === "entrada"
                            ? "bg-green-100"
                            : mov.tipo === "saida"
                              ? "bg-red-100"
                              : "bg-blue-100"
                        }`}
                      >
                        <TipoIcon
                          className={`w-6 h-6 ${
                            mov.tipo === "entrada"
                              ? "text-green-600"
                              : mov.tipo === "saida"
                                ? "text-red-600"
                                : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800">
                            {mov.epi_nome}
                          </h3>
                          <Badge className={tipoColors[mov.tipo]}>
                            {mov.tipo === "entrada"
                              ? "Entrada"
                              : mov.tipo === "saida"
                                ? "Saída"
                                : "Transferência"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {mov.data_movimentacao}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {mov.quantidade} un
                          </span>
                          {mov.valor_total > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              R$ {mov.valor_total?.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {(mov.estoque_origem_nome ||
                          mov.estoque_destino_nome ||
                          mov.obra_destino_nome) && (
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            {mov.estoque_origem_nome && (
                              <Badge variant="outline">
                                De: {mov.estoque_origem_nome}
                              </Badge>
                            )}
                            {(mov.estoque_destino_nome ||
                              mov.obra_destino_nome) && (
                              <Badge variant="outline">
                                Para:{" "}
                                {mov.estoque_destino_nome ||
                                  mov.obra_destino_nome}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

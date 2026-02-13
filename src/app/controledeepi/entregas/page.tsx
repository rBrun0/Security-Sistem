"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Package,
  Search,
  Calendar,
  User,
  Building2,
  Link as LinkIcon,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/lib/utils";
import Link from "next/link";
import z from "zod";
import { ca } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormInput, FormSelect } from "@/src/components/form";

export default function EntregasEPIPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterObra, setFilterObra] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [selectedTrabalhador, setSelectedTrabalhador] = useState("");
  const [selectedObra, setSelectedObra] = useState("");
  const [itensEntrega, setItensEntrega] = useState([
    { epi_id: "", epi_nome: "", ca: "", quantidade: 1, valor_unitario: 0 },
  ]);
  const [responsavelEntrega, setResponsavelEntrega] = useState("");

  const deliverySchema = z.object({
    employee: z.object({
      id: z.string(),
      label: z.string(),
    }),
    enviroment: z.object({
      id: z.string(),
      label: z.string(),
    }),
    deliveryResponsible: z.object({
      id: z.string(),
      label: z.string(),
    }),
    items: z
      .object({
        epi: z.object({
          id: z.string(),
          label: z.string(),
        }),
        quantity: z.number().min(1, "A quantidade deve ser no mínimo 1"),
        ca: z.string().optional(),
      })
      .array(),
  });

  type DeliverySchema = z.infer<typeof deliverySchema>;

  const form = useForm<DeliverySchema>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      items: [
        {
          epi: {
            id: "test",
            label: "Teste",
          },
          ca: "12345",
          quantity: 1,
        },
      ],
    },
  });

  const epiItems = form.watch("items");

  const queryClient = useQueryClient();

  const { data: entregas = [], isLoading } = useQuery({
    queryKey: ["entregas"],
    queryFn: () => base44.entities.EntregaEPI.list("-created_date"),
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ["colaboradores"],
    queryFn: () => base44.entities.Colaborador.list(),
  });

  const { data: ambientes = [] } = useQuery({
    queryKey: ["ambientes"],
    queryFn: () => base44.entities.Ambiente.list(),
  });

  const { data: epis = [] } = useQuery({
    queryKey: ["epis"],
    queryFn: () => base44.entities.EPI.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EntregaEPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entregas"] });
      setIsOpen(false);
      resetForm();
      toast.success("Entrega registrada com sucesso!");
    },
  });

  const resetForm = () => {
    setSelectedTrabalhador("");
    setSelectedObra("");
    setItensEntrega([
      { epi_id: "", epi_nome: "", ca: "", quantidade: 1, valor_unitario: 0 },
    ]);
    setResponsavelEntrega("");
  };

  const handleTrabalhadorChange = (value) => {
    const colaborador = colaboradores.find((c) => c.id === value);
    setSelectedTrabalhador(value);
    if (colaborador?.ambiente_id) {
      setSelectedObra(colaborador.ambiente_id);
    }
  };

  const handleAddItem = () => {
    // setItensEntrega([
    //   ...itensEntrega,
    //   { epi_id: "", epi_nome: "", ca: "", quantidade: 1, valor_unitario: 0 },
    // ]);
    form.setValue("items", [
      ...form.getValues("items"),
      { epi: { id: "", label: "" }, ca: "", quantity: 1 },
    ]);
  };

  const handleRemoveItem = (index) => {
    // if (itensEntrega.length > 1) {
    //   setItensEntrega(itensEntrega.filter((_, i) => i !== index));
    // }

    form.setValue("items", [
      ...form.getValues("items").filter((_, i) => i !== index),
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const newItens = [...itensEntrega];
    if (field === "epi_id") {
      const epi = epis.find((e) => e.id === value);
      newItens[index] = {
        ...newItens[index],
        epi_id: value,
        epi_nome: epi?.nome || "",
        ca: epi?.ca || "",
        valor_unitario: epi?.valor_unitario || 0,
      };
    } else {
      newItens[index] = { ...newItens[index], [field]: value };
    }
    setItensEntrega(newItens);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const colaborador = colaboradores.find((c) => c.id === selectedTrabalhador);
    const ambiente = ambientes.find((a) => a.id === selectedObra);
    const token = Math.random().toString(36).substring(2, 15);

    // createMutation.mutate({
    //   trabalhador_id: selectedTrabalhador,
    //   trabalhador_nome: colaborador?.nome || "",
    //   trabalhador_cpf: colaborador?.cpf || "",
    //   obra_id: selectedObra,
    //   obra_nome: ambiente?.nome || "",
    //   itens: itensEntrega.filter((i) => i.epi_id),
    //   data_entrega: new Date().toISOString().split("T")[0],
    //   responsavel_entrega: responsavelEntrega,
    //   token_assinatura: token,
    //   status: "pendente",
    // });
  };

  const generateSignatureLink = (entrega) => {
    const baseUrl = window.location.origin;
    const path = window.location.pathname.split("/").slice(0, -1).join("/");
    return `${baseUrl}${path}/Assinatura?token=${entrega.token_assinatura}&tipo=trabalhador`;
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const filteredEntregas = entregas.filter((e) => {
    const matchSearch = e.trabalhador_nome
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchObra = filterObra === "todas" || e.obra_id === filterObra;
    const matchStatus = filterStatus === "todos" || e.status === filterStatus;
    return matchSearch && matchObra && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Entregas de EPI</h1>
          <p className="text-slate-500 mt-1">
            Registre e gerencie entregas de EPIs aos trabalhadores
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Entrega
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Entrega de EPI</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <Label>Colaborador *</Label>
                    <Select
                      value={selectedTrabalhador}
                      onValueChange={handleTrabalhadorChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {colaboradores
                          .filter((c) => c.status === "ativo")
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nome} - {c.cpf}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div> */}
                  <FormSelect
                    control={form.control}
                    name="employee"
                    options={colaboradores ?? []}
                    label="Colaborador *"
                    placeholder="Selecione"
                    // getOptionLabel={(c) => `${c.nome} - ${c.cpf}`}
                    // onValueChange={handleTrabalhadorChange}
                  />
                  {/* <div>
                    <Label>Ambiente (Obra) *</Label>
                    <Select
                      value={selectedObra}
                      onValueChange={setSelectedObra}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {ambientes
                          .filter((a) => a.status === "ativo")
                          .map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div> */}
                  <FormSelect
                    control={form.control}
                    name="enviroment"
                    options={ambientes ?? []}
                    label="Ambiente (Obra) *"
                    placeholder="Selecione"
                    // getOptionLabel={(c) => `${c.nome} - ${c.cpf}`}
                    // onValueChange={handleTrabalhadorChange}
                  />
                </div>

                {/* <div>
                  <Label htmlFor="responsavel">Responsável pela Entrega</Label>
                  <Input
                    id="responsavel"
                    value={responsavelEntrega}
                    onChange={(e) => setResponsavelEntrega(e.target.value)}
                    placeholder="Nome de quem está entregando"
                  />
                </div> */}

                <FormInput
                  control={form.control}
                  name="deliveryResponsible"
                  label="Responsável pela Entrega"
                  placeholder="Nome de quem está entregando"
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>EPIs a Entregar</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar EPI
                    </Button>
                  </div>
                  {/* {itensEntrega.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-lg"
                    >
                    <div className="col-span-5">
                      <Label className="text-xs">EPI</Label>
                      <Select
                      value={item.epi_id}
                      onValueChange={(value) =>
                      handleItemChange(index, "epi_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                        {epis.map((epi) => (
                          <SelectItem key={epi.id} value={epi.id}>
                          {epi.nome} {epi.ca && `(CA: ${epi.ca})`}
                          </SelectItem>
                          ))}
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">CA</Label>
                      <Input value={item.ca} disabled className="bg-white" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Qtd</Label>
                      <Input
                      type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) =>
                        handleItemChange(
                          index,
                            "quantidade",
                            parseInt(e.target.value) || 1,
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2 flex items-end justify-center">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={itensEntrega.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))} */}
                  {epiItems?.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="col-span-5">
                        <Label className="text-xs">EPI</Label>
                        <Select
                          value={item.epi_id}
                          onValueChange={(value) =>
                            handleItemChange(index, "epi_id", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {epis.map((epi) => (
                              <SelectItem key={epi.id} value={epi.id}>
                                {epi.nome} {epi.ca && `(CA: ${epi.ca})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">CA</Label>
                        <Input value={item.ca} disabled className="bg-white" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Qtd</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantidade",
                              parseInt(e.target.value) || 1,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-2 flex items-end justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          disabled={epiItems.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

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
                    disabled={
                      !selectedTrabalhador ||
                      !selectedObra ||
                      !itensEntrega.some((i) => i.epi_id)
                    }
                  >
                    Registrar Entrega
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por trabalhador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={filterObra} onValueChange={setFilterObra}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos Ambientes</SelectItem>
            {ambientes.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="assinado">Assinado</SelectItem>
          </SelectContent>
        </Select>
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
      ) : filteredEntregas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhuma entrega encontrada"
                : "Nenhuma entrega registrada"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primeira Entrega
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntregas.map((entrega) => (
            <Card
              key={entrega.id}
              className="border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        entrega.status === "assinado"
                          ? "bg-green-100"
                          : "bg-amber-100"
                      }`}
                    >
                      {entrega.status === "assinado" ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-slate-800">
                          {entrega.trabalhador_nome}
                        </h3>
                        <Badge
                          className={
                            entrega.status === "assinado"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        >
                          {entrega.status === "assinado"
                            ? "Assinado"
                            : "Pendente"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          CPF: {entrega.trabalhador_cpf}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {entrega.obra_nome}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {entrega.data_entrega}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entrega.itens?.map((item, i) => (
                          <Badge key={i} variant="outline">
                            {item.epi_nome} x{item.quantidade}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entrega.status !== "assinado" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(generateSignatureLink(entrega))}
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Link Assinatura
                      </Button>
                    )}
                    <Link
                      href={createPageUrl(`EntregaDetalhe?id=${entrega.id}`)}
                    >
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

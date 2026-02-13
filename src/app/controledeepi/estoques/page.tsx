"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Warehouse,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  MapPin,
  User,
  Package,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/src/components/form/form-input";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { toast } from "sonner";

export default function Estoques() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEstoque, setEditingEstoque] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const estoqueSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    address: z.string().optional(),
    responsible: z.string().optional(),
    active: z.boolean().optional(),
  });

  type EstoqueFormData = z.infer<typeof estoqueSchema>;

  const form = useForm<EstoqueFormData>({
    resolver: zodResolver(estoqueSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      responsible: "",
      active: true,
    },
  });

  const queryClient = useQueryClient();

  const { data: estoques = [], isLoading } = useQuery({
    queryKey: ["estoques"],
    queryFn: () => base44.entities.EstoqueCentral.list(),
  });

  const { data: epis = [] } = useQuery({
    queryKey: ["epis"],
    queryFn: () => base44.entities.EPI.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EstoqueCentral.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estoques"] });
      setIsOpen(false);
      resetForm();
      toast.success("Estoque cadastrado com sucesso!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.entities.EstoqueCentral.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estoques"] });
      setIsOpen(false);
      setEditingEstoque(null);
      resetForm();
      toast.success("Estoque atualizado com sucesso!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EstoqueCentral.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estoques"] });
      toast.success("Estoque excluído com sucesso!");
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      address: "",
      responsible: "",
      active: true,
    });
  };

  const onSubmit = (data: EstoqueFormData) => {
    const submitData = {
      nome: data.name,
      descricao: data.description,
      endereco: data.address,
      responsavel: data.responsible,
      ativo: data.active !== false,
    };

    if (editingEstoque) {
      updateMutation.mutate({ id: editingEstoque.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (estoque) => {
    setEditingEstoque(estoque);
    form.reset({
      name: estoque.nome || "",
      description: estoque.descricao || "",
      address: estoque.endereco || "",
      responsible: estoque.responsavel || "",
      active: estoque.ativo !== false,
    });
    setIsOpen(true);
  };

  const getEpisCount = (estoqueId) => {
    const estoqueEpis = epis.filter((e) => e.estoque_central_id === estoqueId);
    return {
      tipos: estoqueEpis.length,
      quantidade: estoqueEpis.reduce((acc, e) => acc + (e.quantidade || 0), 0),
    };
  };

  const filteredEstoques = estoques.filter((estoque) =>
    estoque.nome?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Estoques Centrais
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os locais de estoque de EPIs
          </p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingEstoque(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Estoque
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEstoque ? "Editar Estoque" : "Novo Estoque Central"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormInput
                  name="name"
                  label="Nome do Estoque"
                  control={form.control}
                  placeholder="Ex: Estoque Principal"
                />
                <FormTextarea
                  name="description"
                  label="Descrição"
                  control={form.control}
                />
                <FormInput
                  name="address"
                  label="Endereço"
                  control={form.control}
                />
                <FormInput
                  name="responsible"
                  label="Responsável"
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
                    {editingEstoque ? "Salvar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEstoques.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Warehouse className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhum estoque encontrado"
                : "Nenhum estoque cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Estoque
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEstoques.map((estoque) => {
            const episInfo = getEpisCount(estoque.id);
            return (
              <Card
                key={estoque.id}
                className="hover:shadow-lg transition-shadow border-0 shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          estoque.ativo ? "bg-amber-100" : "bg-slate-100"
                        }`}
                      >
                        <Warehouse
                          className={`w-6 h-6 ${
                            estoque.ativo ? "text-amber-600" : "text-slate-400"
                          }`}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {estoque.nome}
                        </CardTitle>
                        <Badge
                          className={
                            estoque.ativo
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }
                        >
                          {estoque.ativo ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" /> Ativo
                            </>
                          ) : (
                            "Inativo"
                          )}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(estoque)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            if (confirm("Deseja excluir este estoque?")) {
                              deleteMutation.mutate(estoque.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {estoque.endereco && (
                    <div className="flex items-start gap-2 text-sm text-slate-500">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{estoque.endereco}</span>
                    </div>
                  )}
                  {estoque.responsavel && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <User className="w-4 h-4" />
                      <span>{estoque.responsavel}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Package className="w-4 h-4" />
                    <span>
                      {episInfo.tipos} tipos de EPI • {episInfo.quantidade}{" "}
                      unidades
                    </span>
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

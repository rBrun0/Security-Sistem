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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Users,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Building2,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormInput } from "@/src/components/form/form-input";
import { FormSelect } from "@/src/components/form/form-select";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";

export default function ColaboradoresPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAmbiente, setFilterAmbiente] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  const colaboradorSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    cpf: z.string().min(1, "CPF é obrigatório"),
    rg: z.string().optional(),
    cargo: z.string().optional(),
    funcao: z.string().optional(),
    empresa: z.string().optional(),
    environment_id: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    admission_date: z.string().optional(),
    status: z.enum(["ativo", "inativo", "afastado"]),
  });

  type ColaboradorFormData = z.infer<typeof colaboradorSchema>;

  const form = useForm<ColaboradorFormData>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: {
      name: "",
      cpf: "",
      rg: "",
      cargo: "",
      funcao: "",
      empresa: "",
      environment_id: "",
      telefone: "",
      email: "",
      admission_date: "",
      status: "ativo",
    },
  });

  const queryClient = useQueryClient();

  const { data: colaboradores = [], isLoading } = useQuery({
    queryKey: ["colaboradores"],
    queryFn: () => base44.entities.Colaborador.list(),
  });

  const { data: ambientes = [] } = useQuery({
    queryKey: ["ambientes"],
    queryFn: () => base44.entities.Ambiente.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Colaborador.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colaboradores"] });
      setIsOpen(false);
      resetForm();
      toast.success("Colaborador cadastrado com sucesso!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Colaborador.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colaboradores"] });
      setIsOpen(false);
      setEditingColaborador(null);
      resetForm();
      toast.success("Colaborador atualizado com sucesso!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Colaborador.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colaboradores"] });
      toast.success("Colaborador excluído com sucesso!");
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      cpf: "",
      rg: "",
      cargo: "",
      funcao: "",
      empresa: "",
      environment_id: "",
      telefone: "",
      email: "",
      admission_date: "",
      status: "ativo",
    });
  };

  const onSubmit = (data: ColaboradorFormData) => {
    const submitData = {
      nome: data.name,
      cpf: data.cpf,
      rg: data.rg,
      cargo: data.cargo,
      funcao: data.funcao,
      empresa: data.empresa,
      ambiente_id: data.environment_id,
      telefone: data.telefone,
      email: data.email,
      data_admissao: data.admission_date,
      status: data.status,
    };

    if (editingColaborador) {
      updateMutation.mutate({ id: editingColaborador.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (colaborador) => {
    setEditingColaborador(colaborador);
    form.reset({
      name: colaborador.nome || "",
      cpf: colaborador.cpf || "",
      rg: colaborador.rg || "",
      cargo: colaborador.cargo || "",
      funcao: colaborador.funcao || "",
      empresa: colaborador.empresa || "",
      environment_id: colaborador.ambiente_id || "",
      telefone: colaborador.telefone || "",
      email: colaborador.email || "",
      admission_date: colaborador.data_admissao || "",
      status: colaborador.status || "ativo",
    });
    setIsOpen(true);
  };

  const filteredColaboradores = colaboradores.filter((c) => {
    const matchSearch =
      c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf?.includes(searchTerm);
    const matchAmbiente =
      filterAmbiente === "todos" || c.ambiente_id === filterAmbiente;
    const matchStatus = filterStatus === "todos" || c.status === filterStatus;
    return matchSearch && matchAmbiente && matchStatus;
  });

  const statusColors = {
    ativo: "bg-green-100 text-green-700",
    inativo: "bg-slate-100 text-slate-700",
    afastado: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Colaboradores</h1>
          <p className="text-slate-500 mt-1">
            Gerencie os colaboradores da empresa
          </p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingColaborador(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingColaborador ? "Editar Colaborador" : "Novo Colaborador"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormInput
                  name="name"
                  label="Nome Completo"
                  control={form.control}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput name="cpf" label="CPF" control={form.control} />
                  <FormInput name="rg" label="RG" control={form.control} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="cargo"
                    label="Cargo"
                    control={form.control}
                  />
                  <FormInput
                    name="funcao"
                    label="Função"
                    control={form.control}
                  />
                </div>
                <FormInput
                  name="empresa"
                  label="Empresa"
                  control={form.control}
                />
                <FormSelect
                  name="environment_id"
                  label="Ambiente (Obra) Alocado"
                  control={form.control}
                  options={ambientes
                    .filter((a) => a.status === "ativo")
                    .map((ambiente) => ({
                      label: ambiente.nome,
                      value: ambiente.id,
                    }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="telefone"
                    label="Telefone"
                    control={form.control}
                  />
                  <FormInput
                    name="email"
                    label="E-mail"
                    type="email"
                    control={form.control}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormDatePicker
                    name="admission_date"
                    label="Data Admissão"
                    control={form.control}
                  />
                  <FormSelect
                    name="status"
                    label="Status"
                    control={form.control}
                    options={[
                      { label: "Ativo", value: "ativo" },
                      { label: "Inativo", value: "inativo" },
                      { label: "Afastado", value: "afastado" },
                    ]}
                  />
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
                    className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    {editingColaborador ? "Salvar" : "Cadastrar"}
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
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={filterAmbiente} onValueChange={setFilterAmbiente}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Ambientes</SelectItem>
            {ambientes.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="afastado">Afastado</SelectItem>
          </SelectContent>
        </Select>
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
      ) : filteredColaboradores.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhum colaborador encontrado"
                : "Nenhum colaborador cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Colaborador
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColaboradores.map((colaborador) => (
            <Card
              key={colaborador.id}
              className="hover:shadow-lg transition-shadow border-0 shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {colaborador.nome}
                      </CardTitle>
                      <Badge className={statusColors[colaborador.status]}>
                        {colaborador.status === "ativo"
                          ? "Ativo"
                          : colaborador.status === "inativo"
                            ? "Inativo"
                            : "Afastado"}
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
                      <DropdownMenuItem onClick={() => handleEdit(colaborador)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (confirm("Deseja excluir este colaborador?")) {
                            deleteMutation.mutate(colaborador.id);
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
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-medium">CPF:</span> {colaborador.cpf}
                </div>
                {colaborador.cargo && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Briefcase className="w-4 h-4" />
                    <span>{colaborador.cargo}</span>
                  </div>
                )}
                {colaborador.empresa && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Building2 className="w-4 h-4" />
                    <span>{colaborador.empresa}</span>
                  </div>
                )}
                {colaborador.telefone && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="w-4 h-4" />
                    <span>{colaborador.telefone}</span>
                  </div>
                )}
                {colaborador.ambiente_nome && (
                  <Badge variant="outline" className="mt-2">
                    <Building2 className="w-3 h-3 mr-1" />
                    {colaborador.ambiente_nome}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

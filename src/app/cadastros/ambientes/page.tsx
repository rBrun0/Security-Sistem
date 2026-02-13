"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Building2,
  MapPin,
  User,
  Calendar,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Phone,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FormInput,
  FormPhoneInput,
  FormSelect,
  FormTextarea,
} from "@/src/components/form";
import { Form } from "@/components/ui/form";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import {
  createEnvironment,
  getActiveEnvironments,
  updateEnvironment,
} from "../../modules/enviroments/service";
import { useEnvironments } from "../../modules/enviroments/hooks";
import { getActiveEmployees } from "../../modules/employees/service";
import { useEmployees } from "../../modules/employees/hooks";

export default function AmbientesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingAmbiente, setEditingAmbiente] = useState<{ id: string } | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const enviromentSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    client: z.string().optional(),
    responsible: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(["active", "concluded", "paused"]),
    start_date: z.string().optional(),
    expected_end_date: z.string().optional(),
  });

  type EnviromentFormData = z.infer<typeof enviromentSchema>;

  const form = useForm<EnviromentFormData>({
    resolver: zodResolver(enviromentSchema),
  });

  // console.log("telefone", form.watch("phone"));

  const isLoading = false;

  const queryClient = useQueryClient();

  // const { data: ambientes = [], isLoading } = useQuery({
  //   queryKey: ['ambientes'],
  //   queryFn: () => base44.entities.Ambiente.list()
  // });

  const { data: enviroments = [] } = useEnvironments();

  //   const { data: colaboradores = [] } = useQuery({
  //     queryKey: ["colaboradores"],
  //     queryFn: () => base44.entities.Colaborador.list(),
  //   });

  const { data: employees = [] } = useEmployees();

  const createMutation = useMutation({
    mutationFn: (data) =>
      new Promise((resolve) => setTimeout(() => resolve(data), 1000)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambientes"] });
      setIsOpen(false);
      resetForm();
      toast.success("Ambiente cadastrado com sucesso!");
    },
  });

  // const updateMutation = useMutation({
  //   mutationFn: ({ id, data }) =>
  //     new Promise((resolve) => setTimeout(() => resolve({ id, data }), 1000)),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["ambientes"] });
  //     setIsOpen(false);
  //     setEditingAmbiente(null);
  //     resetForm();
  //     toast.success("Ambiente atualizado com sucesso!");
  //   },
  // });

  // const deleteMutation = useMutation({
  //   mutationFn: (id) =>
  //     new Promise((resolve) => setTimeout(() => resolve(id), 1000)),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["ambientes"] });
  //     toast.success("Ambiente excluído com sucesso!");
  //   },
  // });

  const resetForm = () => {
    form.reset();
  };

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = (data) => {
    if (editingAmbiente) {
      console.log("Editando");
      try {
        // updateMutation.mutate({ id: editingAmbiente.id, data: formData });
        updateEnvironment(editingAmbiente.id, data);
      } finally {
        form.reset();
        setIsOpen(false);
      }
    } else {
      try {
        console.log("Criando");
        // createMutation.mutate(formData);
        createEnvironment(data);
      } finally {
        form.reset();
        setIsOpen(false);
      }
    }
  };

  // const handleEdit = (ambiente) => {
  //   setEditingAmbiente(ambiente);
  //   // setFormData({
  //   //   nome: ambiente.nome || "",
  //   //   endereco: ambiente.endereco || "",
  //   //   cidade: ambiente.cidade || "",
  //   //   estado: ambiente.estado || "",
  //   //   cliente: ambiente.cliente || "",
  //   //   responsavel: ambiente.responsavel || "",
  //   //   telefone: ambiente.telefone || "",
  //   //   status: ambiente.status || "ativo",
  //   //   data_inicio: ambiente.data_inicio || "",
  //   //   data_previsao_fim: ambiente.data_previsao_fim || "",
  //   // });
  //   setIsOpen(true);
  // };

  const getEmployeesCount = async (enviromentId: string) => {
    return employees.filter((c) => c.environment_id === enviromentId).length;
  };

  const filteredEnviroments = enviroments.filter(
    (enviroment) =>
      enviroment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enviroment.client?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const statusColors = {
    active: "bg-green-100 text-green-700",
    concluded: "bg-blue-100 text-blue-700",
    paused: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Ambientes (Obras)
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os ambientes de trabalho
          </p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingAmbiente(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Ambiente
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90vh] flex-col p-0">
            <DialogHeader className="border-b p-6">
              <DialogTitle>
                {editingAmbiente ? "Editar Ambiente" : "Novo Ambiente"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-3">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  id="enviroment-form"
                >
                  <FormInput
                    name="name"
                    label="Nome do Ambiente"
                    control={form.control}
                  />
                  <FormTextarea
                    control={form.control}
                    name={"address"}
                    label="Endereço"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      control={form.control}
                      name="city"
                      label="Cidade"
                    />
                    <FormInput
                      control={form.control}
                      name="state"
                      label="Estado"
                    />
                  </div>
                  <FormInput
                    control={form.control}
                    name="client"
                    label="Cliente"
                  />
                  <div className="grid grid-cols-4 gap-4">
                    <FormInput
                      control={form.control}
                      name="responsible"
                      label="Responsável"
                      containerClassName="col-span-4"
                    />
                    {/* <FormInput
                    control={form.control}
                    name="phone"
                    label="Telefone"
                  /> */}
                    <FormPhoneInput
                      control={form.control}
                      name="phone"
                      label="Telefone"
                      containerClassName="col-span-2"
                    />
                    <FormSelect
                      name={"status"}
                      label="Status"
                      control={form.control}
                      options={[
                        { label: "Ativo", value: "active" },
                        { label: "Concluído", value: "concluded" },
                        { label: "Pausado", value: "paused" },
                      ]}
                      containerClassName="col-span-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormDatePicker
                      control={form.control}
                      name="start_date"
                      label="Data de início"
                    />
                    <FormDatePicker
                      control={form.control}
                      name="expected_end_date"
                      label="Data de previsão de término"
                    />
                  </div>
                </form>
              </Form>
            </div>
            <DialogFooter className="border-t p-1">
              <div className="flex justify-end gap-3 py-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  form="enviroment-form"
                >
                  {editingAmbiente ? "Salvar" : "Cadastrar"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome ou cliente..."
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
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEnviroments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhum ambiente encontrado"
                : "Nenhum ambiente cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Ambiente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnviroments.map((enviroment) => (
            <Card
              key={enviroment.id}
              className="hover:shadow-lg transition-shadow border-0 shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {enviroment.name}
                      </CardTitle>
                      <Badge className={statusColors[enviroment.status]}>
                        {enviroment.status === "active"
                          ? "Ativo"
                          : enviroment.status === "concluded"
                            ? "Concluído"
                            : "Pausado"}
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
                      <DropdownMenuItem
                        // onClick={() => handleEdit(ambiente)}
                        onClick={() =>
                          updateEnvironment(enviroment.id, enviroment)
                        }
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (confirm("Deseja excluir este ambiente?")) {
                            // deleteMutation.mutate(ambiente.id);
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
                {enviroment.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      {enviroment.address}
                      {enviroment.city && `, ${enviroment.city}`}
                      {enviroment.state && ` - ${enviroment.state}`}
                    </span>
                  </div>
                )}
                {enviroment.client && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <User className="w-4 h-4" />
                    <span>{enviroment.client}</span>
                  </div>
                )}
                {enviroment.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="w-4 h-4" />
                    <span>{enviroment.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users className="w-4 h-4" />
                  <span>{getEmployeesCount(enviroment.id)} colaboradores</span>
                </div>
                {enviroment.start_date && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Início: {enviroment.start_date}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
  LoaderCircle,
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
import { Environment } from "../../modules/enviroments/types";

export const FormDialog = ({
  isOpen,
  setIsOpen,
  editingEnvironment,
  setEditingEnviroment,
}: {
  editingEnvironment: Environment | null;
  setEditingEnviroment: Dispatch<SetStateAction<Environment | null>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  // const [isOpen, setIsOpen] = useState(false);
  // const [editingAmbiente, setEditingAmbiente] = useState<{ id: string } | null>(
  //   null,
  // );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const enviromentSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    client: z.string().optional(),
    responsible: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(["active", "concluded", "paused", "deleted"]),
    start_date: z.string({ error: "Tipo inválido" }).optional(),
    expected_end_date: z.string({ error: "Tipo inválido" }).optional(),
  });

  type EnviromentFormData = z.infer<typeof enviromentSchema>;

  const form = useForm<EnviromentFormData>({
    resolver: zodResolver(enviromentSchema),
    defaultValues: {
      status: "active",
    },
  });

  // console.log("form data", form.watch());

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
    if (editingEnvironment) {
      console.log("Editando");
      try {
        setIsLoading(true);
        // updateMutation.mutate({ id: editingAmbiente.id, data: formData });
        updateEnvironment(editingEnvironment.id, data).then(() => {
          queryClient.invalidateQueries({ queryKey: ["environments"] });
        });
      } finally {
        form.reset();
        setIsLoading(false);
        setIsOpen(false);
      }
    } else {
      try {
        setIsLoading(true);
        console.log("Criando");
        // createMutation.mutate(formData);
        createEnvironment(data).then(() => {
          queryClient.invalidateQueries({ queryKey: ["environments"] });
        });
      } finally {
        form.reset();
        setIsOpen(false);
        setIsLoading(false);
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
    (environment) =>
      environment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      environment.client?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const statusColors = {
    active: "bg-green-100 text-green-700",
    concluded: "bg-blue-100 text-blue-700",
    paused: "bg-amber-100 text-amber-700",
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingEnvironment) {
      form.reset(editingEnvironment);
    } else {
      form.reset();
      setEditingEnviroment(null);
    }
  }, [editingEnvironment, isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        console.log("teste de opne", open);
        setIsOpen(open);
        if (!open) {
          setEditingEnviroment(null);
          resetForm();
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            console.log("sssssssssssss");
            // setEditingAmbiente(null);
            setEditingEnviroment(null);
            form.reset();
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Ambiente
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle>
            {editingEnvironment ? "Editar Ambiente" : "Novo Ambiente"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="environment-form"
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
                <FormInput control={form.control} name="city" label="Cidade" />
                <FormInput control={form.control} name="state" label="Estado" />
              </div>
              <FormInput control={form.control} name="client" label="Cliente" />
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
              form="environment-form"
              disabled={isLoading}
            >
              {isLoading && <LoaderCircle className="animate-spin" />}
              {editingEnvironment ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
import { useForm, useWatch } from "react-hook-form";
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
import { useBrazilStates, useStateCities } from "../../modules/locations/hooks";
import { isOptionalValidPhone } from "@/lib/utils";
import { queryKeys } from "../../modules/shared/query-keys";

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
    name: z.string().trim().min(1, "Informe o nome do ambiente."),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    client: z.string().trim().optional(),
    responsible: z.string().trim().optional(),
    phone: z
      .string()
      .optional()
      .refine(isOptionalValidPhone, "Telefone inválido."),
    status: z.enum(["active", "concluded", "paused", "deleted"], {
      error: "Status inválido.",
    }),
    start_date: z.string({ error: "Data de início inválida." }).optional(),
    expected_end_date: z
      .string({ error: "Data prevista de término inválida." })
      .optional(),
  });

  type EnviromentFormData = z.infer<typeof enviromentSchema>;

  const form = useForm<EnviromentFormData>({
    resolver: zodResolver(enviromentSchema),
    defaultValues: {
      status: "active",
    },
  });

  const selectedState = useWatch({
    control: form.control,
    name: "state",
  });

  const { data: states = [], isLoading: loadingStates } = useBrazilStates();
  const { data: cities = [], isLoading: loadingCities } =
    useStateCities(selectedState);

  const queryClient = useQueryClient();

  const { data: enviroments = [] } = useEnvironments();

  const { data: employees = [] } = useEmployees();

  const resetForm = () => {
    form.reset();
  };

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = (data) => {
    const payload = {
      ...data,
      phoneNumber: data.phone,
    };

    if (editingEnvironment) {
      try {
        setIsLoading(true);
        updateEnvironment(editingEnvironment.id, payload).then(() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.environments });
        });
      } finally {
        form.reset();
        setIsLoading(false);
        setIsOpen(false);
      }
    } else {
      try {
        setIsLoading(true);
        createEnvironment(payload).then(() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.environments });
        });
      } finally {
        form.reset();
        setIsOpen(false);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingEnvironment) {
      const legacyPhone =
        "phone" in editingEnvironment &&
        typeof editingEnvironment.phone === "string"
          ? editingEnvironment.phone
          : "";

      form.reset({
        ...editingEnvironment,
        phone: legacyPhone || editingEnvironment.phoneNumber || "",
      });
    } else {
      form.reset();
      setEditingEnviroment(null);
    }
  }, [editingEnvironment, isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
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
                <FormSelect
                  control={form.control}
                  name="state"
                  label="Estado"
                  placeholder={loadingStates ? "Carregando..." : "Selecione"}
                  options={states.map((state) => ({
                    label: `${state.sigla} - ${state.nome}`,
                    value: state.sigla,
                  }))}
                  onValueChange={() => {
                    form.setValue("city", "");
                  }}
                />
                <FormSelect
                  control={form.control}
                  name="city"
                  label="Cidade"
                  disabled={!selectedState || loadingCities}
                  placeholder={
                    !selectedState
                      ? "Selecione o estado"
                      : loadingCities
                        ? "Carregando..."
                        : "Selecione"
                  }
                  options={cities.map((city) => ({
                    label: city.nome,
                    value: city.nome,
                  }))}
                />
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

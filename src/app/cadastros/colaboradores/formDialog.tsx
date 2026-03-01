"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FormDocumentInput,
  FormInput,
  FormPhoneInput,
  FormSelect,
} from "@/src/components/form";
import { Form } from "@/components/ui/form";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import { Employee } from "../../modules/employees/types";
import { employeeSchema, EmployeeForm } from "../../modules/employees/schema";
import {
  createEmployee,
  updateEmployee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "../../modules/employees/service";
import { useEnvironments } from "../../modules/enviroments/hooks";
import { useCompanies } from "../../modules/companies/hooks";
import { normalizeDateInputToLocalISO } from "@/src/lib/date";

export const FormDialog = ({
  isOpen,
  setIsOpen,
  editingColaborador,
  setEditingColaborador,
}: {
  editingColaborador: Employee | null;
  setEditingColaborador: Dispatch<SetStateAction<Employee | null>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: environments = [] } = useEnvironments();
  const { data: companies = [] } = useCompanies();

  const form = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { status: "active" },
  });

  const mapEmployeeToForm = (employee: Employee): EmployeeForm => ({
    name: employee.name,
    cpf: employee.cpf,
    rg: employee.rg,
    job_title: employee.job_title,
    role: employee.role,
    company: employee.company,
    environment_id: employee.environment_id,
    phone: employee.phone,
    email: employee.email,
    admission_date:
      typeof employee.admission_date === "string"
        ? employee.admission_date
        : (normalizeDateInputToLocalISO(employee.admission_date) ?? ""),
    status: employee.status,
  });

  const toEmployeePayload = (data: EmployeeForm): CreateEmployeeInput => ({
    name: data.name,
    cpf: data.cpf,
    status: data.status,
    rg: data.rg,
    job_title: data.job_title,
    role: data.role,
    company: data.company,
    environment_id: data.environment_id,
    phone: data.phone,
    email: data.email,
    admission_date: data.admission_date,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingColaborador) {
      form.reset(mapEmployeeToForm(editingColaborador));
    } else {
      form.reset({
        status: "active",
      });
      setEditingColaborador(null);
    }
  }, [editingColaborador, form, isOpen, setEditingColaborador]);

  const onSubmit = async (data: EmployeeForm) => {
    let shouldCloseDialog = true;

    try {
      setIsLoading(true);
      const payload = toEmployeePayload(data);

      if (editingColaborador) {
        await updateEmployee(
          editingColaborador.id,
          payload as UpdateEmployeeInput,
        );
        toast.success("Colaborador atualizado");
      } else {
        await createEmployee(payload);
        toast.success("Colaborador criado");
      }
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    } catch (err) {
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        if (message.includes("cpf")) {
          form.setError("cpf", { message: err.message });
          toast.error(err.message);
          shouldCloseDialog = false;
          return;
        }
        if (message.includes("rg")) {
          form.setError("rg", { message: err.message });
          toast.error(err.message);
          shouldCloseDialog = false;
          return;
        }
      }

      toast.error("Erro ao salvar colaborador");
      console.error(err);
    } finally {
      setIsLoading(false);
      if (shouldCloseDialog) {
        setIsOpen(false);
        form.reset();
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setEditingColaborador(null);
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingColaborador(null);
            form.reset({ status: "active" });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Colaborador
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle>
            {editingColaborador ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="employee-form"
            >
              <FormInput
                name="name"
                label="Nome Completo"
                control={form.control}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormDocumentInput
                  control={form.control}
                  name="cpf"
                  documentType="cpf"
                  label="CPF"
                />
                <FormInput name="rg" label="RG" control={form.control} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name="job_title"
                  label="CBO"
                  control={form.control}
                />
                <FormInput name="role" label="Função" control={form.control} />
              </div>
              <FormSelect
                name="company"
                label="Empresa"
                control={form.control}
                options={companies.map((c) => ({
                  label: c.name,
                  value: c.name,
                }))}
              />
              <FormSelect
                name="environment_id"
                label="Ambiente (Obra) Alocado"
                control={form.control}
                options={environments.map((e) => ({
                  label: e.name,
                  value: e.id,
                }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormPhoneInput
                  name="phone"
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
                    { label: "Ativo", value: "active" },
                    { label: "Inativo", value: "inactive" },
                    { label: "Afastado", value: "on_leave" },
                  ]}
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
              form="employee-form"
              disabled={isLoading}
            >
              {isLoading && <LoaderCircle className="animate-spin" />}
              {editingColaborador ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

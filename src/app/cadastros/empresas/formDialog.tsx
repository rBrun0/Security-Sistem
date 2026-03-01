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
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  FormDocumentInput,
  FormInput,
  FormPhoneInput,
  FormSelect,
  FormTextarea,
} from "@/src/components/form";
import { Form } from "@/components/ui/form";
import { Company } from "../../modules/companies/types";
import { CompanyForm, companySchema } from "../../modules/companies/schema";
import { createCompany, updateCompany } from "../../modules/companies/service";
import { useBrazilStates, useStateCities } from "../../modules/locations/hooks";
// import { companySchema, CompanyForm } from "@/app/modules/companies/schema";
// import { createCompany, updateCompany } from "@/app/modules/companies/service";
// import { Company } from "@/app/modules/companies/types";

export const FormDialog = ({
  isOpen,
  setIsOpen,
  editingCompany,
  setEditingCompany,
}: {
  editingCompany: Company | null;
  setEditingCompany: Dispatch<SetStateAction<Company | null>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { status: "active" },
  });

  const selectedState = useWatch({
    control: form.control,
    name: "state",
  });

  const { data: states = [], isLoading: loadingStates } = useBrazilStates();
  const { data: cities = [], isLoading: loadingCities } =
    useStateCities(selectedState);

  const mapCompanyToForm = (company: Company): CompanyForm => ({
    name: company.name,
    document: company.document,
    description: company.description,
    address: company.address,
    city: company.city,
    state: company.state,
    contact_name: company.contact_name,
    phone: company.phone,
    status: company.status,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingCompany) {
      form.reset(mapCompanyToForm(editingCompany));
    } else {
      form.reset();
      setEditingCompany(null);
    }
  }, [editingCompany, form, isOpen, setEditingCompany]);

  const onSubmit = async (data: CompanyForm) => {
    let shouldCloseDialog = true;

    try {
      setIsLoading(true);
      if (editingCompany) {
        await updateCompany(editingCompany.id, data);
        toast.success("Empresa atualizada");
      } else {
        await createCompany(data);
        toast.success("Empresa criada");
      }
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes("cnpj")) {
        form.setError("document", { message: err.message });
        toast.error(err.message);
        shouldCloseDialog = false;
        return;
      }

      toast.error("Erro ao salvar empresa");
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
          setEditingCompany(null);
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingCompany(null);
            form.reset({ status: "active" });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle>
            {editingCompany ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="company-form"
            >
              <FormInput name="name" label="Nome" control={form.control} />
              <FormDocumentInput
                name="document"
                label="Documento (CNPJ)"
                control={form.control}
                documentType="cnpj"
                placeholder="00.000.000/0000-00"
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
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  name="state"
                  label="Estado"
                  control={form.control}
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
                  name="city"
                  label="Cidade"
                  control={form.control}
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
              <FormInput
                name="contact_name"
                label="Pessoa para contato"
                control={form.control}
              />
              <FormPhoneInput
                name="phone"
                label="Telefone"
                control={form.control}
              />
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
              form="company-form"
              disabled={isLoading}
            >
              {isLoading && <LoaderCircle className="animate-spin" />}
              {editingCompany ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

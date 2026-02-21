"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Plus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormInput, FormPhoneInput, FormTextarea } from "@/src/components/form";
import { Form } from "@/components/ui/form";
import { Company } from "../../modules/companies/types";
import { CompanyForm, companySchema } from "../../modules/companies/schema";
import { createCompany, updateCompany } from "../../modules/companies/service";
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
      toast.error("Erro ao salvar empresa");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      form.reset();
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCompany ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="company-form"
            >
              <FormInput name="name" label="Nome" control={form.control} />
              <FormInput
                name="document"
                label="Documento (CNPJ)"
                control={form.control}
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
                <FormInput name="city" label="Cidade" control={form.control} />
                <FormInput name="state" label="Estado" control={form.control} />
              </div>
              <FormInput
                name="contact_name"
                label="Contato"
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
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
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

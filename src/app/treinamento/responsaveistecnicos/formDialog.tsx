"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { FormInput, FormPhoneInput, FormTextarea } from "@/src/components/form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateTechnicalResponsible,
  useUpdateTechnicalResponsible,
} from "../../modules/responsaveistecnicos/hooks";
import { Instructor } from "../../modules/instructors/types";
import { isOptionalValidPhone } from "@/lib/utils";

const technicalResponsibleSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do responsável técnico."),
  cpf: z.string().trim().optional(),
  phoneNumber: z
    .string()
    .optional()
    .refine(isOptionalValidPhone, "Telefone inválido."),
  email: z
    .string()
    .trim()
    .email("E-mail inválido.")
    .optional()
    .or(z.literal("")),
  qualifications: z.string().trim().optional(),
  professionalRegistrations: z
    .object({
      type: z.string().trim().optional(),
      number: z.string().trim().optional(),
      mte: z.string().trim().optional(),
    })
    .array(),
});

type TechnicalResponsibleFormData = z.infer<typeof technicalResponsibleSchema>;

export const FormDialog = ({
  isOpen,
  setIsOpen,
  editingTechnicalResponsible,
  setEditingTechnicalResponsible,
}: {
  editingTechnicalResponsible: Instructor | null;
  setEditingTechnicalResponsible: Dispatch<SetStateAction<Instructor | null>>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const form = useForm<TechnicalResponsibleFormData>({
    resolver: zodResolver(technicalResponsibleSchema),
    defaultValues: {
      name: "",
      cpf: "",
      phoneNumber: "",
      email: "",
      qualifications: "",
      professionalRegistrations: [
        {
          type: "",
          number: "",
          mte: "",
        },
      ],
    },
  });

  const {
    fields: professionalRegistrations,
    append: addRegistration,
    remove: removeRegistration,
  } = useFieldArray({
    control: form.control,
    name: "professionalRegistrations",
  });

  const createMutation = useCreateTechnicalResponsible();
  const updateMutation = useUpdateTechnicalResponsible();

  useEffect(() => {
    if (!isOpen) return;

    if (editingTechnicalResponsible) {
      form.reset({
        name: editingTechnicalResponsible.name || "",
        cpf: editingTechnicalResponsible.cpf || "",
        phoneNumber: editingTechnicalResponsible.phoneNumber || "",
        email: editingTechnicalResponsible.email || "",
        qualifications: editingTechnicalResponsible.qualifications || "",
        professionalRegistrations: editingTechnicalResponsible
          .professionalRegistrations?.length
          ? editingTechnicalResponsible.professionalRegistrations
          : [{ type: "", number: "", mte: "" }],
      });
      return;
    }

    form.reset();
  }, [editingTechnicalResponsible, form, isOpen]);

  const onSubmit = (data: TechnicalResponsibleFormData) => {
    const submitData: Omit<Instructor, "id"> = {
      name: data.name,
      cpf: data.cpf,
      email: data.email,
      phoneNumber: data.phoneNumber,
      qualifications: data.qualifications,
      professionalRegistrations: data.professionalRegistrations,
    };

    if (editingTechnicalResponsible?.id) {
      updateMutation.mutate(
        {
          id: editingTechnicalResponsible.id,
          data: submitData,
        },
        {
          onSuccess: () => {
            setIsOpen(false);
            setEditingTechnicalResponsible(null);
            form.reset();
            toast.success("Responsável técnico atualizado com sucesso!");
          },
          onError: (error) => {
            if (
              error instanceof Error &&
              error.message.toLowerCase().includes("cpf")
            ) {
              form.setError("cpf", { message: error.message });
              toast.error(error.message);
              return;
            }

            toast.error("Não foi possível atualizar o responsável técnico.");
          },
        },
      );
      return;
    }

    createMutation.mutate(submitData, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
        toast.success("Responsável técnico cadastrado com sucesso!");
      },
      onError: (error) => {
        if (
          error instanceof Error &&
          error.message.toLowerCase().includes("cpf")
        ) {
          form.setError("cpf", { message: error.message });
          toast.error(error.message);
          return;
        }

        toast.error("Não foi possível cadastrar o responsável técnico.");
      },
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setEditingTechnicalResponsible(null);
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => {
            setEditingTechnicalResponsible(null);
            form.reset();
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Responsável
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle>
            {editingTechnicalResponsible
              ? "Editar Responsável Técnico"
              : "Novo Responsável Técnico"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="technical-responsible-form"
            >
              <FormInput
                name="name"
                label="Nome Completo"
                control={form.control}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput name="cpf" label="CPF" control={form.control} />
                <FormPhoneInput
                  name="phoneNumber"
                  label="Telefone"
                  control={form.control}
                />
              </div>

              <FormInput
                name="email"
                label="E-mail"
                type="email"
                control={form.control}
              />

              <FormTextarea
                name="qualifications"
                label="Qualificações"
                control={form.control}
                placeholder="Formações, certificações e experiência"
              />

              <div className="flex items-center justify-between">
                <Label>Registros Profissionais</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addRegistration({ type: "", number: "", mte: "" })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {professionalRegistrations.map((registration, index) => (
                <div
                  key={registration.id}
                  className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <Label className="text-xs">Tipo</Label>
                    <FormInput
                      name={`professionalRegistrations.${index}.type`}
                      placeholder="CREA, CRM..."
                      control={form.control}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Número</Label>
                    <FormInput
                      name={`professionalRegistrations.${index}.number`}
                      control={form.control}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">MTE</Label>
                    <FormInput
                      name={`professionalRegistrations.${index}.mte`}
                      control={form.control}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRegistration(index)}
                      disabled={professionalRegistrations.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
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
              className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
              form="technical-responsible-form"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingTechnicalResponsible ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

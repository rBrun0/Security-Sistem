"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { FormInput, FormPhoneInput, FormTextarea } from "@/src/components/form";
import { Form } from "@/components/ui/form";
import { Instructor } from "../../modules/instructors/types";
import {
  createInstructor,
  updateInstructor,
} from "../../modules/instructors/service";
import { Label } from "@/components/ui/label";

const instructorSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  qualifications: z.string().optional(),
  professionalRegistrations: z
    .object({
      type: z.string().optional(),
      number: z.string().optional(),
      mte: z.string().optional(),
    })
    .array(),
});

type InstructorFormData = z.infer<typeof instructorSchema>;

export const FormDialog = ({
  isOpen,
  setIsOpen,
  editingInstructor,
  setEditingInstructor,
}: {
  editingInstructor: Instructor | null;
  setEditingInstructor: Dispatch<SetStateAction<Instructor | null>>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InstructorFormData>({
    resolver: zodResolver(instructorSchema),
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

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Omit<Instructor, "id">) => createInstructor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      setIsOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Instructor> }) =>
      updateInstructor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      setIsOpen(false);
      setEditingInstructor(null);
      form.reset();
    },
  });

  console.log("editingInstructor", editingInstructor);

  useEffect(() => {
    if (!isOpen) return;
    if (editingInstructor) {
      form.reset({
        name: editingInstructor.name || editingInstructor.name || "",
        cpf: editingInstructor.cpf || "",
        phoneNumber:
          editingInstructor.phoneNumber || editingInstructor.phoneNumber || "",
        email: editingInstructor.email || "",
        qualifications:
          editingInstructor.qualifications ||
          editingInstructor.qualifications ||
          "",
        professionalRegistrations:
          editingInstructor.professionalRegistrations || [],
      });
    } else {
      form.reset();
    }
  }, [editingInstructor, isOpen]);

  const onSubmit = (data: InstructorFormData) => {
    console.log("submit", data);
    const submitData = {
      name: data.name,
      cpf: data.cpf,
      email: data.email,
      phoneNumber: data.phoneNumber,
      qualifications: data.qualifications,
      professionalRegistrations: data.professionalRegistrations,
    };

    if (editingInstructor && editingInstructor.id) {
      updateMutation.mutate({ id: editingInstructor.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setEditingInstructor(null);
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => {
            setEditingInstructor(null);
            form.reset();
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Instrutor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingInstructor ? "Editar Instrutor" : "Novo Instrutor"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="Formações, certificações, experiência..."
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

            {professionalRegistrations.map((register, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <FormInput
                    name={`professionalRegistrations.${index}.type`}
                    placeholder="CREA, CRM..."
                    control={form.control}
                    // onChange={(e) =>
                    //   // updateRegistro(index, "tipo", e.target.value)
                    //   addRegistration
                    // }
                  />
                </div>
                <div>
                  <Label className="text-xs">Número</Label>
                  <FormInput
                    name={`professionalRegistrations.${index}.number`}
                    control={form.control}
                    // onChange={(e) =>
                    //   updateRegistro(index, "numero", e.target.value)
                    // }
                  />
                </div>
                <div>
                  <Label className="text-xs">MTE</Label>
                  <FormInput
                    control={form.control}
                    name={`professionalRegistrations.${index}.mte`}
                    // onChange={(e) =>
                    //   updateRegistro(index, "mte", e.target.value)
                    // }
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
                className="bg-purple-600 hover:bg-purple-700"
              >
                {editingInstructor ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

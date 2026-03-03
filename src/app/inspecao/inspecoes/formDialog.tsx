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
import { FormSelect, FormTextarea } from "@/src/components/form";
import { Form } from "@/components/ui/form";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import { Inspection } from "../../modules/inspections/types";
import {
  inspectionSchema,
  InspectionForm,
} from "../../modules/inspections/schema";
import {
  createInspection,
  CreateInspectionInput,
  updateInspection,
  UpdateInspectionInput,
} from "../../modules/inspections/service";
import { useEnvironments } from "../../modules/enviroments/hooks";
import { todayLocalISODate } from "@/src/lib/date";
import { queryKeys } from "../../modules/shared/query-keys";

export const FormDialog = ({
  isOpen,
  setIsOpen,
  editingInspection,
  setEditingInspection,
}: {
  editingInspection: Inspection | null;
  setEditingInspection: Dispatch<SetStateAction<Inspection | null>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: environments = [] } = useEnvironments();

  const form = useForm<InspectionForm>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: { status: "pending", photo_urls: [] },
  });

  const mapInspectionToForm = (inspection: Inspection): InspectionForm => ({
    environment_id: inspection.environment_id,
    inspection_date: inspection.inspection_date,
    observations: inspection.observations,
    irregularity: inspection.irregularity,
    technical_basis: inspection.technical_basis,
    technical_standard: inspection.technical_standard,
    photo_urls: inspection.photo_urls ?? [],
    status: inspection.status,
  });

  const toInspectionPayload = (data: InspectionForm): CreateInspectionInput => {
    const env = environments.find(
      (environment) => environment.id === data.environment_id,
    );

    return {
      environment_id: data.environment_id,
      inspection_date: data.inspection_date,
      observations: data.observations,
      irregularity: data.irregularity,
      technical_basis: data.technical_basis,
      technical_standard: data.technical_standard,
      photo_urls: data.photo_urls,
      status: data.status,
      environment_name: env?.name || "",
    };
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingInspection) {
      form.reset(mapInspectionToForm(editingInspection));
    } else {
      form.reset({
        status: "pending",
        inspection_date: todayLocalISODate(),
        photo_urls: [],
      });
      setEditingInspection(null);
    }
  }, [editingInspection, form, isOpen, setEditingInspection]);

  const onSubmit = async (data: InspectionForm) => {
    try {
      setIsLoading(true);
      const payload = toInspectionPayload(data);

      if (editingInspection) {
        await updateInspection(
          editingInspection.id,
          payload as UpdateInspectionInput,
        );
        toast.success("Inspeção atualizada");
      } else {
        await createInspection(payload);
        toast.success("Inspeção criada");
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.inspections });
    } catch (err) {
      toast.error("Erro ao salvar inspeção");
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
          setEditingInspection(null);
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => {
            setEditingInspection(null);
            form.reset({
              status: "pending",
              inspection_date: todayLocalISODate(),
              photo_urls: [],
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Inspeção
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle>
            {editingInspection ? "Editar Inspeção" : "Nova Inspeção"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="inspection-form"
            >
              <FormSelect
                name="environment_id"
                label="Obra"
                control={form.control}
                options={environments.map((e) => ({
                  label: e.name,
                  value: e.id,
                }))}
              />
              <FormDatePicker
                name="inspection_date"
                label="Data da Inspeção"
                control={form.control}
              />
              <FormSelect
                name="status"
                label="Status"
                control={form.control}
                options={[
                  { label: "Pendente", value: "pending" },
                  { label: "Concluída", value: "completed" },
                  { label: "Aprovada", value: "approved" },
                ]}
              />
              <FormTextarea
                name="observations"
                label="Observações"
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
              className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
              form="inspection-form"
              disabled={isLoading}
            >
              {isLoading && <LoaderCircle className="animate-spin" />}
              {editingInspection ? "Salvar" : "Criar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

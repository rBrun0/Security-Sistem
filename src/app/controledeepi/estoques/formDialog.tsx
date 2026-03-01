"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { ChevronDown, FileSpreadsheet, Plus, Upload } from "lucide-react";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/src/components/form/form-input";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { toast } from "sonner";
import {
  useCreateCentralWarehouse,
  useUpdateCentralWarehouse,
} from "@/src/app/modules/central-warehouses/hooks";
import { CentralWarehouse } from "@/src/app/modules/central-warehouses/types";
import {
  useCreateEPI,
  useEPIs,
  useUpdateEPI,
} from "@/src/app/modules/epis/hooks";
import { isDuplicateEPIError } from "@/src/app/modules/epis/service";
import { FormSwitch } from "@/src/components/form/form-switch";
import { Label } from "@/components/ui/label";
import { PreviewEpiImport } from "@/src/actions/preview-import";
import { EPI } from "@/src/app/modules/epis/types";
import { buildEPIIdentityKey } from "@/src/app/modules/epis/identity";
import { useApplyEPIMovement } from "@/src/app/modules/epi-movements/hooks";
import { isStockMovementError } from "@/src/app/modules/epi-movements/service";
import { todayLocalISODate } from "@/src/lib/date";

const warehouseSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do estoque."),
  description: z.string().trim().optional(),
  address: z.string().trim().optional(),
  responsible: z.string().trim().optional(),
  isActive: z.boolean(),
  importedEpis: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Informe o nome do EPI."),
        description: z.string().trim().optional(),
        ca: z.string().trim().optional(),
        caValidity: z.string().optional(),
        category: z.string().optional(),
        quantity: z.coerce
          .number()
          .min(0, "A quantidade não pode ser negativa."),
        usageTime: z.coerce
          .number()
          .min(1, "O tempo de uso deve ser pelo menos 1 dia."),
        unitValue: z.coerce
          .number()
          .min(0, "O valor unitário não pode ser negativo."),
      }),
    )
    .default([]),
});

type WarehouseFormInput = z.input<typeof warehouseSchema>;
type WarehouseFormData = z.output<typeof warehouseSchema>;

type FormDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingWarehouse: CentralWarehouse | null;
  setEditingWarehouse: Dispatch<SetStateAction<CentralWarehouse | null>>;
};

export const FormDialog = ({
  isOpen,
  setIsOpen,
  editingWarehouse,
  setEditingWarehouse,
}: FormDialogProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [importedFileName, setImportedFileName] = useState("");
  const [expandedEpiIndex, setExpandedEpiIndex] = useState<number | null>(null);

  const createMutation = useCreateCentralWarehouse();
  const updateMutation = useUpdateCentralWarehouse();
  const createEPIMutation = useCreateEPI();
  const updateEPIMutation = useUpdateEPI();
  const applyMovementMutation = useApplyEPIMovement();
  const { data: epis = [] } = useEPIs();

  const form = useForm<WarehouseFormInput, unknown, WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      responsible: "",
      isActive: true,
      importedEpis: [],
    },
  });

  const { fields: importedEpiFields, replace: replaceImportedEpis } =
    useFieldArray({
      control: form.control,
      name: "importedEpis",
    });

  const watchedImportedEpis =
    useWatch({
      control: form.control,
      name: "importedEpis",
    }) ?? [];

  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      address: "",
      responsible: "",
      isActive: true,
      importedEpis: [],
    });

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setImportedFileName("");
    replaceImportedEpis([]);
    setExpandedEpiIndex(null);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const isExcel =
      file.name.toLowerCase().endsWith(".xlsx") ||
      file.name.toLowerCase().endsWith(".xls");

    if (!isExcel) {
      toast.error("Selecione um arquivo Excel (.xlsx ou .xls).");
      event.target.value = "";
      return;
    }

    try {
      const { validRows, invalidRows } = await PreviewEpiImport(file);

      setImportedFileName(file.name);
      replaceImportedEpis(
        validRows as NonNullable<WarehouseFormInput["importedEpis"]>,
      );
      setExpandedEpiIndex(validRows.length > 0 ? 0 : null);

      if (validRows.length === 0) {
        toast.error("Nenhum EPI válido encontrado na planilha.");
        return;
      }

      if (invalidRows.length > 0) {
        toast.warning(
          `Importação parcial: ${validRows.length} válidos e ${invalidRows.length} inválidos.`,
        );
        return;
      }

      toast.success("Arquivo importado com sucesso!");
    } catch {
      toast.error("Não foi possível ler o arquivo Excel.");
    }
  };

  const createImportedEpis = async (
    warehouseId: string,
    warehouseName: string,
    importedEpis: WarehouseFormData["importedEpis"],
  ): Promise<{ createdCount: number; restockedCount: number }> => {
    if (!importedEpis.length) {
      return { createdCount: 0, restockedCount: 0 };
    }

    let createdCount = 0;
    let restockedCount = 0;
    const workingEpis: EPI[] = [...epis];

    for (const importedEpi of importedEpis) {
      const importedIdentity = buildEPIIdentityKey({
        name: importedEpi.name,
        ca: importedEpi.ca,
        centralWarehouseId: warehouseId,
      });

      const existingEpi = workingEpis.find(
        (epi) =>
          buildEPIIdentityKey({
            name: epi.name,
            ca: epi.ca,
            centralWarehouseId: epi.centralWarehouseId,
          }) === importedIdentity,
      );

      if (existingEpi?.id) {
        await applyMovementMutation.mutateAsync({
          type: "entrada",
          epiId: existingEpi.id,
          epiName: existingEpi.name,
          quantity: importedEpi.quantity,
          unitValue: importedEpi.unitValue,
          totalValue: importedEpi.quantity * importedEpi.unitValue,
          destinationWarehouseId: warehouseId,
          destinationWarehouseName: warehouseName,
          movementDate: todayLocalISODate(),
          observation:
            "Reposição automática via importação de planilha no estoque.",
        });

        await updateEPIMutation.mutateAsync({
          id: existingEpi.id,
          data: {
            description: importedEpi.description || existingEpi.description,
            caValidity: importedEpi.caValidity || existingEpi.caValidity,
            category: importedEpi.category
              ? (importedEpi.category as EPI["category"])
              : existingEpi.category,
            isActive: true,
            centralWarehouseId: warehouseId,
            centralWarehouseName: warehouseName,
            unitValue: importedEpi.unitValue,
          },
        });

        const existingIndex = workingEpis.findIndex(
          (item) => item.id === existingEpi.id,
        );

        if (existingIndex >= 0) {
          workingEpis[existingIndex] = {
            ...workingEpis[existingIndex],
            isActive: true,
            centralWarehouseId: warehouseId,
            centralWarehouseName: warehouseName,
            quantity:
              (workingEpis[existingIndex].quantity || 0) + importedEpi.quantity,
            unitValue: importedEpi.unitValue,
          };
        }

        restockedCount += 1;
        continue;
      }

      const epiPayload: Omit<EPI, "id"> = {
        name: importedEpi.name,
        description: importedEpi.description,
        ca: importedEpi.ca,
        caValidity: importedEpi.caValidity,
        category: importedEpi.category as EPI["category"],
        isActive: true,
        centralWarehouseId: warehouseId,
        centralWarehouseName: warehouseName,
        quantity: importedEpi.quantity,
        unitValue: importedEpi.unitValue,
      };

      const createdEpiRef = await createEPIMutation.mutateAsync(epiPayload);
      workingEpis.push({
        id: createdEpiRef.id,
        ...epiPayload,
      });
      createdCount += 1;
    }

    return { createdCount, restockedCount };
  };

  const onSubmit = (data: WarehouseFormData) => {
    const { importedEpis, ...warehouseData } = data;
    const payload: Omit<CentralWarehouse, "id"> = warehouseData;

    if (editingWarehouse?.id) {
      updateMutation
        .mutateAsync({
          id: editingWarehouse.id,
          data: payload,
        })
        .then(async () =>
          createImportedEpis(editingWarehouse.id, payload.name, importedEpis),
        )
        .then(({ createdCount, restockedCount }) => {
          if (importedEpis.length > 0) {
            toast.success(
              `Estoque atualizado: ${createdCount} novo(s) e ${restockedCount} reposição(ões) de EPI.`,
            );
          } else {
            toast.success("Estoque atualizado com sucesso!");
          }

          setIsOpen(false);
          setEditingWarehouse(null);
          resetForm();
        })
        .catch((error) => {
          if (isStockMovementError(error)) {
            toast.error(error.message);
            return;
          }

          if (isDuplicateEPIError(error)) {
            toast.error(
              "Foi identificado EPI duplicado no mesmo estoque. Use movimentação de Entrada para reposição.",
            );
            return;
          }

          toast.error("Não foi possível salvar o estoque.");
        });

      return;
    }

    createMutation
      .mutateAsync(payload)
      .then(async (newWarehouseRef) =>
        createImportedEpis(newWarehouseRef.id, payload.name, importedEpis),
      )
      .then(({ createdCount, restockedCount }) => {
        if (importedEpis.length > 0) {
          toast.success(
            `Estoque cadastrado: ${createdCount} novo(s) e ${restockedCount} reposição(ões) de EPI.`,
          );
        } else {
          toast.success("Estoque cadastrado com sucesso!");
        }

        setIsOpen(false);
        setEditingWarehouse(null);
        resetForm();
      })
      .catch((error) => {
        if (isStockMovementError(error)) {
          toast.error(error.message);
          return;
        }

        if (isDuplicateEPIError(error)) {
          toast.error(
            "Foi identificado EPI duplicado no mesmo estoque. Use movimentação de Entrada para reposição.",
          );
          return;
        }

        toast.error("Não foi possível salvar o estoque.");
      });
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editingWarehouse) {
      form.reset({
        name: editingWarehouse.name,
        description: editingWarehouse.description ?? "",
        address: editingWarehouse.address ?? "",
        responsible: editingWarehouse.responsible ?? "",
        isActive: editingWarehouse.isActive,
      });
      return;
    }

    resetForm();
  }, [editingWarehouse, isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setEditingWarehouse(null);
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="bg-amber-600 hover:bg-amber-700"
          onClick={() => {
            setEditingWarehouse(null);
            resetForm();
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Estoque
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle>
            {editingWarehouse ? "Editar Estoque" : "Novo Estoque Central"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <Form {...form}>
            <form
              id="warehouse-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormInput
                name="name"
                label="Nome"
                control={form.control}
                placeholder="Ex: Estoque Principal"
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
              <FormInput
                name="responsible"
                label="Responsável"
                control={form.control}
              />

              <div className="flex justify-between items-center rounded-md bg-gray-100 px-4 py-3">
                <div className="flex flex-col">
                  <h1 className="font-semibold">Estoque ativo</h1>
                  <p className="text-sm">
                    Estoque disponível para movimentações
                  </p>
                </div>
                <FormSwitch control={form.control} name="isActive" />
              </div>

              <div className="flex flex-col pt-4 space-y-3">
                <Label className="text-md">Epis</Label>

                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-white p-2 shadow-sm">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      </div>
                      <p className="text-sm text-slate-600">
                        Importe uma planilha Excel com os EPIs
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white"
                      onClick={() => inputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-3 w-3" />
                      Selecionar arquivo
                    </Button>
                  </div>

                  {importedFileName && (
                    <div className="mt-4 rounded-md border bg-white p-3">
                      <p className="text-xs text-slate-500">
                        Arquivo selecionado
                      </p>
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {importedFileName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {watchedImportedEpis.length} item(ns) importado(s)
                      </p>
                    </div>
                  )}

                  {importedEpiFields.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {importedEpiFields.map((epiField, index) => {
                        const epi = watchedImportedEpis[index] ?? epiField;
                        const isExpanded = expandedEpiIndex === index;

                        return (
                          <div
                            key={epiField.id}
                            className="rounded-md border bg-white transition-all duration-300"
                          >
                            <button
                              type="button"
                              className="w-full flex items-center justify-between p-3 text-left"
                              onClick={() =>
                                setExpandedEpiIndex((current) =>
                                  current === index ? null : index,
                                )
                              }
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-800">
                                  {epi.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  CA: {epi.ca || "-"} • Qtd:{" "}
                                  {String(epi.quantity ?? 0)} • R${" "}
                                  {String(epi.unitValue ?? 0)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                Editar
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="grid grid-cols-2 gap-3 border-t p-3">
                                <div className="col-span-2">
                                  <FormInput
                                    name={`importedEpis.${index}.name` as const}
                                    control={form.control}
                                    label="Nome"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    name={`importedEpis.${index}.ca` as const}
                                    control={form.control}
                                    label="CA"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    name={
                                      `importedEpis.${index}.category` as const
                                    }
                                    control={form.control}
                                    label="Categoria"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    name={
                                      `importedEpis.${index}.quantity` as const
                                    }
                                    control={form.control}
                                    label="Quantidade"
                                    type="number"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    name={
                                      `importedEpis.${index}.unitValue` as const
                                    }
                                    control={form.control}
                                    label="Valor Unitário"
                                    type="number"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    name={
                                      `importedEpis.${index}.usageTime` as const
                                    }
                                    control={form.control}
                                    label="Tempo de Uso (dias)"
                                    type="number"
                                  />
                                </div>
                                <div>
                                  <FormInput
                                    name={
                                      `importedEpis.${index}.caValidity` as const
                                    }
                                    control={form.control}
                                    label="Validade do CA"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <FormTextarea
                                    name={
                                      `importedEpis.${index}.description` as const
                                    }
                                    control={form.control}
                                    label="Descrição"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="warehouse-form"
              className="bg-amber-600 hover:bg-amber-700"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                createEPIMutation.isPending
              }
            >
              {editingWarehouse ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

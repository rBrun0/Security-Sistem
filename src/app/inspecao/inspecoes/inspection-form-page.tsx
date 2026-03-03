"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { createPageUrl } from "@/lib/utils";
import { PageHeader } from "@/src/components/common";
import {
  FormDatePicker,
  FormSelect,
  FormTextarea,
} from "@/src/components/form";

import { useEnvironments } from "../../modules/enviroments/hooks";
import {
  clearInspectionDraftIdFromStorage,
  getInspectionDraftIdFromStorage,
  setInspectionDraftIdInStorage,
} from "../../modules/inspections/draft-storage";
import {
  createInspectionDraft,
  getInspectionById,
  publishInspection,
  saveInspectionDraft,
  updateInspection,
  uploadInspectionPhotos,
} from "../../modules/inspections/service";
import {
  inspectionSchema,
  InspectionForm,
  InspectionPhotoFindingForm,
} from "../../modules/inspections/schema";
import {
  filterNormativeItems,
  NORMATIVE_ITEMS,
} from "../../modules/inspections/normative-items";
import { NR_STANDARDS } from "../../modules/inspections/standards";
import { queryKeys } from "../../modules/shared/query-keys";
import { todayLocalISODate } from "@/src/lib/date";
import { Inspection } from "../../modules/inspections/types";
import { Label } from "@/components/ui/label";

type InspectionFormPageProps = {
  mode: "create" | "edit";
  inspectionId?: string;
};

const DEFAULT_VALUES: InspectionForm = {
  environment_id: "",
  inspection_date: todayLocalISODate(),
  status: "pending",
  observations: "",
  irregularity: "",
  technical_basis: "",
  technical_standard: "",
  photo_urls: [],
  photo_findings: [],
};

const REQUIRED_FINDING_FIELDS: Array<
  keyof Pick<
    InspectionPhotoFindingForm,
    "irregularity" | "technical_standard" | "technical_basis"
  >
> = ["irregularity", "technical_standard", "technical_basis"];

export function InspectionFormPage({
  mode,
  inspectionId,
}: InspectionFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: environments = [] } = useEnvironments();

  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(
    inspectionId ?? null,
  );
  const [recordStatus, setRecordStatus] = useState<Inspection["record_status"]>(
    mode === "create" ? "draft" : "active",
  );
  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [standardFilterByFinding, setStandardFilterByFinding] = useState<
    Record<number, string>
  >({});
  const [keywordFilterByFinding, setKeywordFilterByFinding] = useState<
    Record<number, string>
  >({});
  const [lastAutoSaveAt, setLastAutoSaveAt] = useState<Date | null>(null);
  const [selectedFilesCount, setSelectedFilesCount] = useState(0);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<InspectionForm>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const watchedValues = useWatch({ control: form.control });

  const filterStandards = useCallback((rawFilter: string) => {
    const normalizedFilter = rawFilter.trim().toLowerCase();

    if (!normalizedFilter) {
      return NR_STANDARDS;
    }

    return NR_STANDARDS.filter((standard) =>
      standard.label.toLowerCase().includes(normalizedFilter),
    );
  }, []);

  const toPayload = useCallback(
    (data: InspectionForm) => {
      const environment = environments.find(
        (item) => item.id === data.environment_id,
      );
      const normalizedFindings = (data.photo_findings ?? []).map((finding) => {
        const normalizedNormativeItemRef = finding.normative_item_ref?.trim();

        return {
          photo_url: finding.photo_url,
          irregularity: finding.irregularity.trim(),
          technical_standard: finding.technical_standard.trim(),
          technical_basis: finding.technical_basis.trim(),
          ...(normalizedNormativeItemRef
            ? { normative_item_ref: normalizedNormativeItemRef }
            : {}),
        };
      });
      const firstFinding = normalizedFindings[0];

      return {
        environment_id: data.environment_id,
        environment_name: environment?.name ?? "",
        inspection_date: data.inspection_date,
        status: data.status,
        observations: data.observations?.trim() || undefined,
        irregularity: firstFinding?.irregularity || undefined,
        technical_basis: firstFinding?.technical_basis || undefined,
        technical_standard: firstFinding?.technical_standard || undefined,
        photo_urls: normalizedFindings.map((finding) => finding.photo_url),
        photo_findings: normalizedFindings,
      };
    },
    [environments],
  );

  const toFormValues = useCallback((inspection: Inspection): InspectionForm => {
    const normalizedFindings =
      inspection.photo_findings && inspection.photo_findings.length > 0
        ? inspection.photo_findings
        : (inspection.photo_urls ?? []).map((photoUrl, index) => ({
            photo_url: photoUrl,
            irregularity: index === 0 ? (inspection.irregularity ?? "") : "",
            technical_basis:
              index === 0 ? (inspection.technical_basis ?? "") : "",
            technical_standard:
              index === 0 ? (inspection.technical_standard ?? "") : "",
            normative_item_ref: "",
          }));

    return {
      environment_id: inspection.environment_id,
      inspection_date: inspection.inspection_date,
      status: inspection.status,
      observations: inspection.observations ?? "",
      irregularity: inspection.irregularity ?? "",
      technical_basis: inspection.technical_basis ?? "",
      technical_standard: inspection.technical_standard ?? "",
      photo_urls: normalizedFindings.map((finding) => finding.photo_url),
      photo_findings: normalizedFindings,
    };
  }, []);

  const leaveForm = useCallback(() => {
    clearInspectionDraftIdFromStorage();
    router.push(createPageUrl("inspecao/inspecoes"));
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setInitializing(true);

        if (mode === "create") {
          const storedDraftId = getInspectionDraftIdFromStorage();

          if (storedDraftId) {
            const storedInspection = await getInspectionById(storedDraftId);

            if (
              storedInspection &&
              storedInspection.isActive !== false &&
              storedInspection.record_status === "draft"
            ) {
              if (!isMounted) return;

              setCurrentInspectionId(storedInspection.id);
              setRecordStatus("draft");
              form.reset(toFormValues(storedInspection));
              return;
            }

            clearInspectionDraftIdFromStorage();
          }

          const draft = await createInspectionDraft({
            inspection_date: todayLocalISODate(),
            status: "pending",
          });

          if (!isMounted) return;

          setInspectionDraftIdInStorage(draft.id);
          setCurrentInspectionId(draft.id);
          setRecordStatus("draft");
          form.reset(DEFAULT_VALUES);
          return;
        }

        if (!inspectionId) {
          throw new Error("Inspeção inválida.");
        }

        const inspection = await getInspectionById(inspectionId);

        if (!isMounted) return;

        if (!inspection || inspection.isActive === false) {
          toast.error("Inspeção não encontrada.");
          router.push(createPageUrl("inspecao/inspecoes"));
          return;
        }

        setCurrentInspectionId(inspection.id);
        setRecordStatus(inspection.record_status ?? "active");

        form.reset(toFormValues(inspection));
      } catch {
        toast.error("Erro ao carregar inspeção.");
        router.push(createPageUrl("inspecao/inspecoes"));
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    void init();

    return () => {
      isMounted = false;
    };
  }, [form, inspectionId, mode, router, toFormValues]);

  useEffect(() => {
    if (mode !== "create" || !currentInspectionId) {
      return;
    }

    setInspectionDraftIdInStorage(currentInspectionId);
  }, [currentInspectionId, mode]);

  useEffect(() => {
    if (initializing || !currentInspectionId || recordStatus !== "draft") {
      return;
    }

    if (!form.formState.isDirty) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        await saveInspectionDraft(
          currentInspectionId,
          toPayload(watchedValues as InspectionForm),
        );
        setLastAutoSaveAt(new Date());
      } catch (err) {
        console.log("ERROR SAVING DRAFT", err);
        toast.error("Não foi possível salvar o rascunho.");
      }
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    currentInspectionId,
    form.formState.isDirty,
    initializing,
    recordStatus,
    toPayload,
    watchedValues,
  ]);

  const handleUploadPhotos = async (files: File[]) => {
    if (!currentInspectionId || files.length === 0) {
      return;
    }

    try {
      setUploadingPhotos(true);
      const uploadedUrls = await uploadInspectionPhotos(
        currentInspectionId,
        files,
      );
      const currentFindings = form.getValues("photo_findings") ?? [];
      const nextFindings = [
        ...currentFindings,
        ...uploadedUrls.map((url) => ({
          photo_url: url,
          irregularity: "",
          technical_standard: "",
          technical_basis: "",
          normative_item_ref: "",
        })),
      ];
      const nextUrls = nextFindings.map((finding) => finding.photo_url);

      form.setValue("photo_urls", nextUrls, {
        shouldDirty: true,
        shouldValidate: false,
      });
      form.setValue("photo_findings", nextFindings, {
        shouldDirty: true,
        shouldValidate: false,
      });

      if (recordStatus === "draft") {
        await saveInspectionDraft(currentInspectionId, {
          photo_urls: nextUrls,
          photo_findings: nextFindings,
        });
        setLastAutoSaveAt(new Date());
      } else {
        await updateInspection(currentInspectionId, {
          photo_urls: nextUrls,
          photo_findings: nextFindings,
        });
      }
    } catch {
      toast.error("Erro ao enviar fotos.");
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    if (!currentInspectionId) {
      return;
    }

    const nextFindings = (form.getValues("photo_findings") ?? []).filter(
      (finding) => finding.photo_url !== photoUrl,
    );
    const nextUrls = nextFindings.map((finding) => finding.photo_url);

    form.setValue("photo_urls", nextUrls, {
      shouldDirty: true,
      shouldValidate: false,
    });
    form.setValue("photo_findings", nextFindings, {
      shouldDirty: true,
      shouldValidate: false,
    });

    form.clearErrors("photo_findings");

    setStandardFilterByFinding((previous) => {
      const next: Record<number, string> = {};
      nextFindings.forEach((_, index) => {
        next[index] = previous[index] ?? "";
      });
      return next;
    });

    setKeywordFilterByFinding((previous) => {
      const next: Record<number, string> = {};
      nextFindings.forEach((_, index) => {
        next[index] = previous[index] ?? "";
      });
      return next;
    });

    try {
      if (recordStatus === "draft") {
        await saveInspectionDraft(currentInspectionId, {
          photo_urls: nextUrls,
          photo_findings: nextFindings,
        });
        setLastAutoSaveAt(new Date());
      } else {
        await updateInspection(currentInspectionId, {
          photo_urls: nextUrls,
          photo_findings: nextFindings,
        });
      }
    } catch {
      toast.error("Erro ao remover foto.");
    }
  };

  const getPhotoLabel = useCallback((url: string, index: number) => {
    try {
      const pathname = new URL(url).pathname;
      const fileName = decodeURIComponent(pathname.split("/").pop() ?? "");

      if (!fileName) {
        return `Foto ${index + 1}`;
      }

      return fileName.length > 32 ? `${fileName.slice(0, 32)}...` : fileName;
    } catch {
      return `Foto ${index + 1}`;
    }
  }, []);

  const canAddNewPhoto = useCallback(async () => {
    const findings = form.getValues("photo_findings") ?? [];

    if (findings.length === 0) {
      return true;
    }

    const fieldsToValidate = findings.flatMap((_, index) =>
      REQUIRED_FINDING_FIELDS.map(
        (field) => `photo_findings.${index}.${field}` as const,
      ),
    );

    const isValid = await form.trigger(fieldsToValidate);

    if (!isValid) {
      toast.error(
        "Preencha irregularidade, norma e embasamento das fotos antes de adicionar nova imagem.",
      );
      return false;
    }

    form.clearErrors(fieldsToValidate);

    return true;
  }, [form]);

  const handleOpenPhotoPicker = useCallback(async () => {
    if (uploadingPhotos || saving) {
      return;
    }

    const isValid = await canAddNewPhoto();

    if (!isValid) {
      return;
    }

    photoInputRef.current?.click();
  }, [canAddNewPhoto, saving, uploadingPhotos]);

  const handleNormativeItemChange = useCallback(
    (index: number, value: string) => {
      const normativeItem = NORMATIVE_ITEMS.find((item) => item.id === value);

      form.setValue(`photo_findings.${index}.normative_item_ref`, value, {
        shouldDirty: true,
      });

      if (!normativeItem) {
        return;
      }

      form.setValue(
        `photo_findings.${index}.technical_standard`,
        normativeItem.standard,
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );

      const currentBasis =
        form.getValues(`photo_findings.${index}.technical_basis`) ?? "";

      if (!currentBasis.trim()) {
        form.setValue(
          `photo_findings.${index}.technical_basis`,
          normativeItem.reference,
          {
            shouldDirty: true,
            shouldValidate: true,
          },
        );
      }
    },
    [form],
  );

  const handlePublish = form.handleSubmit(async (data) => {
    if (!currentInspectionId) {
      toast.error("Inspeção ainda está sendo preparada.");
      return;
    }

    try {
      setSaving(true);
      await publishInspection(currentInspectionId, toPayload(data));
      clearInspectionDraftIdFromStorage();
      await queryClient.invalidateQueries({ queryKey: queryKeys.inspections });
      toast.success("Inspeção salva com sucesso.");
      router.push(createPageUrl("inspecao/inspecoes"));
    } catch {
      toast.error("Erro ao salvar inspeção.");
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={mode === "create" ? "Nova Inspeção" : "Editar Inspeção"}
        description="Rascunho salvo automaticamente para evitar perda de dados"
        actions={
          <Button variant="outline" onClick={leaveForm}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para inspeções
          </Button>
        }
      />

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>Dados da Inspeção</span>
            <span className="text-sm font-medium text-slate-500">
              {recordStatus === "draft" ? "Status: Rascunho" : "Status: Ativa"}
            </span>
          </CardTitle>
          {lastAutoSaveAt && recordStatus === "draft" ? (
            <p className="text-sm text-emerald-700">
              Rascunho salvo às {lastAutoSaveAt.toLocaleTimeString("pt-BR")}
            </p>
          ) : null}
        </CardHeader>

        <CardContent>
          {initializing ? (
            <div className="flex items-center gap-2 text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Carregando formulário...
            </div>
          ) : (
            <Form {...form}>
              <form className="space-y-4" onSubmit={handlePublish}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormSelect
                    name="environment_id"
                    label="Obra"
                    control={form.control}
                    options={environments.map((environment) => ({
                      label: environment.name,
                      value: environment.id,
                    }))}
                    placeholder="Selecione uma obra"
                  />

                  <FormDatePicker
                    name="inspection_date"
                    label="Data da Inspeção"
                    control={form.control}
                  />
                </div>

                <FormSelect
                  name="status"
                  label="Situação da inspeção"
                  control={form.control}
                  options={[
                    { label: "Pendente", value: "pending" },
                    { label: "Concluída", value: "completed" },
                    { label: "Aprovada", value: "approved" },
                  ]}
                />

                <FormTextarea
                  name="observations"
                  label="Observações gerais"
                  control={form.control}
                  placeholder="Informações adicionais da inspeção"
                />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Itens da inspeção por foto
                  </Label>
                  <Input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const fileList = event.target.files;
                      if (!fileList?.length) {
                        return;
                      }

                      void (async () => {
                        setSelectedFilesCount(fileList.length);
                        await handleUploadPhotos(Array.from(fileList));
                        setSelectedFilesCount(0);
                      })();
                      event.target.value = "";
                    }}
                    disabled={uploadingPhotos || saving}
                  />

                  {(form.watch("photo_findings") ?? []).length > 0 ? (
                    <div className="space-y-4">
                      {(form.watch("photo_findings") ?? []).map(
                        (finding, index) => {
                          const filter = standardFilterByFinding[index] ?? "";
                          const filteredStandards = filterStandards(filter);
                          const keywordFilter =
                            keywordFilterByFinding[index] ?? "";
                          const normativeOptions = filterNormativeItems(
                            finding.technical_standard || filter,
                            keywordFilter,
                          ).map((item) => ({
                            value: item.id,
                            label: `${item.standard} • ${item.code} - ${item.title}`,
                          }));

                          return (
                            <div
                              key={finding.photo_url}
                              className="space-y-3 rounded-md border p-3"
                            >
                              <div className="flex items-start gap-3">
                                <a
                                  href={finding.photo_url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    src={finding.photo_url}
                                    alt={`Foto da inspeção ${index + 1}`}
                                    className="h-24 w-24 rounded-md object-cover"
                                  />
                                </a>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-slate-700">
                                    Item da foto {index + 1}
                                  </p>
                                  <a
                                    href={finding.photo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block truncate text-sm text-emerald-700 hover:underline"
                                    title={finding.photo_url}
                                  >
                                    {getPhotoLabel(finding.photo_url, index)}
                                  </a>
                                  <p className="text-xs text-slate-500">
                                    Clique na imagem para ampliar.
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    void handleRemovePhoto(finding.photo_url)
                                  }
                                  disabled={saving || uploadingPhotos}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              <FormTextarea
                                name={`photo_findings.${index}.irregularity`}
                                label="Irregularidade"
                                control={form.control}
                                placeholder="Descreva o que foi identificado nesta foto"
                              />

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">
                                    Filtro de norma
                                  </Label>
                                  <Input
                                    value={filter}
                                    placeholder="Ex.: NR-18"
                                    onChange={(event) =>
                                      setStandardFilterByFinding(
                                        (previous) => ({
                                          ...previous,
                                          [index]: event.target.value,
                                        }),
                                      )
                                    }
                                  />
                                </div>

                                <FormSelect
                                  name={`photo_findings.${index}.technical_standard`}
                                  label="Norma técnica"
                                  control={form.control}
                                  options={filteredStandards}
                                  placeholder="Selecione a NR"
                                />
                              </div>

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">
                                    Buscar item normativo
                                  </Label>
                                  <Input
                                    value={keywordFilter}
                                    placeholder="Ex.: escada, andaime, extintor"
                                    onChange={(event) =>
                                      setKeywordFilterByFinding((previous) => ({
                                        ...previous,
                                        [index]: event.target.value,
                                      }))
                                    }
                                  />
                                </div>

                                <FormSelect
                                  name={`photo_findings.${index}.normative_item_ref`}
                                  label="Item da norma"
                                  control={form.control}
                                  options={normativeOptions}
                                  placeholder={
                                    normativeOptions.length
                                      ? "Selecione um item"
                                      : "Nenhum item encontrado"
                                  }
                                  onValueChange={(value) =>
                                    handleNormativeItemChange(index, value)
                                  }
                                />
                              </div>

                              <FormTextarea
                                name={`photo_findings.${index}.technical_basis`}
                                label="Embasamento técnico"
                                control={form.control}
                                placeholder="Explique tecnicamente o enquadramento desta foto"
                              />
                              <p className="text-xs text-slate-500">
                                Dica: ao selecionar um item da norma, a norma e
                                referência técnica podem ser preenchidas
                                automaticamente.
                              </p>
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleOpenPhotoPicker()}
                      disabled={uploadingPhotos || saving}
                    >
                      {form.watch("photo_findings")?.length
                        ? "Adicionar nova foto"
                        : "Adicionar primeira foto"}
                    </Button>
                    <span className="text-sm text-slate-500">
                      {selectedFilesCount > 0
                        ? `${selectedFilesCount} arquivo(s) selecionado(s)`
                        : "Nenhum arquivo selecionado"}
                    </span>
                    {uploadingPhotos ? (
                      <LoaderCircle className="h-4 w-4 animate-spin text-slate-500" />
                    ) : (
                      <Upload className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Adicione uma foto por vez e preencha irregularidade, norma e
                    embasamento técnico para liberar a próxima.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={leaveForm}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving || initializing}>
                    {saving ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Salvar inspeção
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

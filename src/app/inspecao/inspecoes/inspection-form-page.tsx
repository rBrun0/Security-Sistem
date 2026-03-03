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
  FormInput,
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
} from "../../modules/inspections/schema";
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
};

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
  const [standardFilter, setStandardFilter] = useState("");
  const [lastAutoSaveAt, setLastAutoSaveAt] = useState<Date | null>(null);
  const [selectedFilesCount, setSelectedFilesCount] = useState(0);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<InspectionForm>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const watchedValues = useWatch({ control: form.control });

  const filteredStandards = useMemo(() => {
    const normalizedFilter = standardFilter.trim().toLowerCase();

    if (!normalizedFilter) {
      return NR_STANDARDS;
    }

    return NR_STANDARDS.filter((standard) =>
      standard.label.toLowerCase().includes(normalizedFilter),
    );
  }, [standardFilter]);

  const toPayload = useCallback(
    (data: InspectionForm) => {
      const environment = environments.find(
        (item) => item.id === data.environment_id,
      );

      return {
        environment_id: data.environment_id,
        environment_name: environment?.name ?? "",
        inspection_date: data.inspection_date,
        status: data.status,
        observations: data.observations?.trim() || undefined,
        irregularity: data.irregularity?.trim() || undefined,
        technical_basis: data.technical_basis?.trim() || undefined,
        technical_standard: data.technical_standard?.trim() || undefined,
        photo_urls: data.photo_urls ?? [],
      };
    },
    [environments],
  );

  const toFormValues = useCallback((inspection: Inspection): InspectionForm => {
    return {
      environment_id: inspection.environment_id,
      inspection_date: inspection.inspection_date,
      status: inspection.status,
      observations: inspection.observations ?? "",
      irregularity: inspection.irregularity ?? "",
      technical_basis: inspection.technical_basis ?? "",
      technical_standard: inspection.technical_standard ?? "",
      photo_urls: inspection.photo_urls ?? [],
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
      } catch {
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
      const currentUrls = form.getValues("photo_urls") ?? [];
      const nextUrls = [...currentUrls, ...uploadedUrls];

      form.setValue("photo_urls", nextUrls, {
        shouldDirty: true,
        shouldValidate: true,
      });

      if (recordStatus === "draft") {
        await saveInspectionDraft(currentInspectionId, {
          photo_urls: nextUrls,
        });
        setLastAutoSaveAt(new Date());
      } else {
        await updateInspection(currentInspectionId, { photo_urls: nextUrls });
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

    const nextUrls = (form.getValues("photo_urls") ?? []).filter(
      (url) => url !== photoUrl,
    );

    form.setValue("photo_urls", nextUrls, {
      shouldDirty: true,
      shouldValidate: true,
    });

    try {
      if (recordStatus === "draft") {
        await saveInspectionDraft(currentInspectionId, {
          photo_urls: nextUrls,
        });
        setLastAutoSaveAt(new Date());
      } else {
        await updateInspection(currentInspectionId, { photo_urls: nextUrls });
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
        description="Rascunho salvo automaticamente no Firebase para evitar perda de dados"
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
                  name="irregularity"
                  label="Irregularidade identificada"
                  control={form.control}
                  placeholder="Descreva a irregularidade encontrada na imagem/local"
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormInput
                    name="technical_standard"
                    label="Filtro de norma"
                    control={form.control}
                    placeholder="Ex.: NR-18"
                    onChange={(value) => setStandardFilter(String(value ?? ""))}
                  />

                  <FormSelect
                    name="technical_standard"
                    label="Norma técnica"
                    control={form.control}
                    options={filteredStandards}
                    placeholder="Selecione a NR"
                  />
                </div>

                <FormTextarea
                  name="technical_basis"
                  label="Embasamento técnico"
                  control={form.control}
                  placeholder="Explique tecnicamente o enquadramento da irregularidade"
                />

                <FormTextarea
                  name="observations"
                  label="Observações gerais"
                  control={form.control}
                  placeholder="Informações adicionais da inspeção"
                />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Fotos da inspeção
                  </Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhotos || saving}
                    >
                      Selecionar imagens
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
                    Por enquanto o envio é por importação de imagem. Depois
                    podemos habilitar captura direta da câmera.
                  </p>

                  {(form.watch("photo_urls") ?? []).length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {(form.watch("photo_urls") ?? []).map((url, index) => (
                        <div
                          key={url}
                          className="flex items-start gap-3 rounded-md border p-3"
                        >
                          <a href={url} target="_blank" rel="noreferrer">
                            <img
                              src={url}
                              alt={`Foto da inspeção ${index + 1}`}
                              className="h-20 w-20 rounded-md object-cover"
                            />
                          </a>
                          <div className="min-w-0 flex-1">
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="block truncate text-sm font-medium text-emerald-700 hover:underline"
                              title={url}
                            >
                              {getPhotoLabel(url, index)}
                            </a>
                            <p className="text-xs text-slate-500">
                              Clique na imagem para abrir em tamanho maior.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => void handleRemovePhoto(url)}
                            disabled={saving || uploadingPhotos}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : null}
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

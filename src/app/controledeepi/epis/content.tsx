"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, HardHat, Search, Package } from "lucide-react";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/src/components/form/form-input";
import { FormSelect } from "@/src/components/form/form-select";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import { toast } from "sonner";
import {
  useCreateEPI,
  useEPIs,
  useUpdateEPI,
} from "@/src/app/modules/epis/hooks";
import { isDuplicateEPIError } from "@/src/app/modules/epis/service";
import { EPI } from "@/src/app/modules/epis/types";
import { useCentralWarehouses } from "@/src/app/modules/central-warehouses/hooks";
import { EPICard } from "@/components/domains/card-epi";
import {
  EmptyStateCard,
  LoadingCardGrid,
  PageHeader,
} from "@/src/components/common";

const CATEGORIAS = [
  { value: "cabeca", label: "Proteção da Cabeça" },
  { value: "olhos_face", label: "Proteção dos Olhos e Face" },
  { value: "auditivo", label: "Proteção Auditiva" },
  { value: "respiratorio", label: "Proteção Respiratória" },
  { value: "tronco", label: "Proteção do Tronco" },
  { value: "membros_superiores", label: "Proteção dos Membros Superiores" },
  { value: "membros_inferiores", label: "Proteção dos Membros Inferiores" },
  { value: "corpo_inteiro", label: "Proteção do Corpo Inteiro" },
  { value: "queda", label: "Proteção Contra Quedas" },
] as const;

const categoriaColors: Record<string, string> = {
  cabeca: "bg-blue-100 text-blue-700",
  olhos_face: "bg-purple-100 text-purple-700",
  auditivo: "bg-green-100 text-green-700",
  respiratorio: "bg-teal-100 text-teal-700",
  tronco: "bg-orange-100 text-orange-700",
  membros_superiores: "bg-pink-100 text-pink-700",
  membros_inferiores: "bg-indigo-100 text-indigo-700",
  corpo_inteiro: "bg-amber-100 text-amber-700",
  queda: "bg-red-100 text-red-700",
};

export const epiSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do EPI."),
  description: z.string().trim().optional(),
  ca: z.string().trim().optional(),
  caValidity: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
  centralWarehouseId: z.string().optional(),
  quantity: z.coerce.number().min(0, "A quantidade não pode ser negativa."),
  usageTime: z.coerce
    .number()
    .min(1, "O tempo de uso deve ser pelo menos 1 dia."),
  unitValue: z.coerce
    .number()
    .min(0, "O valor unitário não pode ser negativo."),
});

type EPIFormInput = z.input<typeof epiSchema>;
type EPIFormOutput = z.output<typeof epiSchema>;

export default function EPIs() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEPI, setEditingEPI] = useState<EPI | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("todas");
  const [filterEstoque, setFilterEstoque] = useState("todos");

  const { data: epis = [], isLoading } = useEPIs();
  const { data: estoques = [] } = useCentralWarehouses();
  const createMutation = useCreateEPI();
  const updateMutation = useUpdateEPI();

  const form = useForm<EPIFormInput, unknown, EPIFormOutput>({
    resolver: zodResolver(epiSchema),
    defaultValues: {
      name: "",
      description: "",
      ca: "",
      caValidity: "",
      category: "",
      isActive: true,
      centralWarehouseId: "",
      quantity: 0,
      unitValue: 0,
      usageTime: {
        value: "1",
        label: "1 dia",
      },
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      ca: "",
      caValidity: "",
      category: "",
      isActive: true,
      centralWarehouseId: "",
      quantity: 0,
      unitValue: 0,
    });
  };

  const onSubmit = async (data: EPIFormOutput) => {
    const estoque = estoques.find(
      (item) => item.id === data.centralWarehouseId,
    );

    const payload: Omit<EPI, "id"> = {
      name: data.name,
      description: data.description,
      ca: data.ca,
      caValidity: data.caValidity,
      category: data.category as EPI["category"],
      isActive: data.isActive,
      centralWarehouseId: data.centralWarehouseId,
      centralWarehouseName: estoque?.name,
      quantity: data.quantity,
      unitValue: data.unitValue,
    };

    try {
      if (editingEPI?.id) {
        await updateMutation.mutateAsync({ id: editingEPI.id, data: payload });
        toast.success("EPI atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("EPI cadastrado com sucesso!");
      }

      setIsOpen(false);
      setEditingEPI(null);
      resetForm();
    } catch (error) {
      if (isDuplicateEPIError(error)) {
        toast.error(
          "Esse EPI já existe no estoque selecionado. Faça reposição em Movimentações > Entrada.",
        );
        return;
      }

      toast.error("Não foi possível salvar o EPI.");
    }
  };

  const handleEdit = (epi: EPI) => {
    setEditingEPI(epi);
    form.reset({
      name: epi.name,
      description: epi.description ?? "",
      ca: epi.ca ?? "",
      caValidity: epi.caValidity ?? "",
      category: epi.category ?? "",
      isActive: epi.isActive ?? true,
      centralWarehouseId: epi.centralWarehouseId ?? "",
      quantity: epi.quantity ?? 0,
      unitValue: epi.unitValue ?? 0,
    });
    setIsOpen(true);
  };

  const filteredEPIs = useMemo(
    () =>
      epis.filter((epi) => {
        const search = searchTerm.toLowerCase();
        const matchSearch =
          epi.name.toLowerCase().includes(search) ||
          epi.ca?.toLowerCase().includes(search);
        const matchCategoria =
          filterCategoria === "todas" || epi.category === filterCategoria;
        const matchEstoque =
          filterEstoque === "todos" || epi.centralWarehouseId === filterEstoque;
        const matchAtivo = epi.isActive !== false;
        return matchSearch && matchCategoria && matchEstoque && matchAtivo;
      }),
    [epis, filterCategoria, filterEstoque, searchTerm],
  );

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-50 flex flex-col gap-6 border-b bg-slate-50 pt-6 pb-4">
        <PageHeader
          title="EPIs"
          description="Gerencie os equipamentos de proteção individual"
          actions={
            <Dialog
              open={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) {
                  setEditingEPI(null);
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo EPI
                </Button>
              </DialogTrigger>
              <DialogContent className="flex max-h-[90vh] max-w-lg flex-col p-0">
                <DialogHeader className="border-b p-6">
                  <DialogTitle>
                    {editingEPI ? "Editar EPI" : "Novo EPI"}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                      id="epi-form"
                    >
                      <FormInput
                        name="name"
                        label="Nome"
                        control={form.control}
                        placeholder="Ex: Capacete de Segurança"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput
                          name="ca"
                          label="CA (Certificado de Aprovação)"
                          control={form.control}
                          placeholder="Ex: 12345"
                        />
                        <FormDatePicker
                          name="caValidity"
                          label="Validade CA"
                          control={form.control}
                        />
                      </div>
                      <FormSelect
                        name="category"
                        label="Categoria"
                        control={form.control}
                        options={CATEGORIAS.map((cat) => ({
                          label: cat.label,
                          value: cat.value,
                        }))}
                      />
                      <FormSelect
                        name="centralWarehouseId"
                        label="Estoque Central"
                        control={form.control}
                        options={estoques
                          .filter((warehouse) => warehouse.isActive)
                          .map((warehouse) => ({
                            label: warehouse.name,
                            value: warehouse.id,
                          }))}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <FormInput
                          name="quantity"
                          label="Qtd. em estoque"
                          type="number"
                          control={form.control}
                        />
                        <FormInput
                          name="unitValue"
                          label="Valor Unitário (R$)"
                          type="number"
                          control={form.control}
                        />
                        <FormSelect
                          control={form.control}
                          name="usageTime"
                          label="Tempo de uso (dias)"
                          options={Array.from({ length: 90 }).map(
                            (_item, index) => ({
                              label: `${index + 1}`,
                              value: (index + 1).toString(),
                            }),
                          )}
                        />
                      </div>
                      <FormTextarea
                        name="description"
                        label="Descrição"
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
                      form="epi-form"
                      className="bg-amber-600 hover:bg-amber-700"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {editingEPI ? "Salvar" : "Cadastrar"}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou CA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas Categorias</SelectItem>
              {CATEGORIAS.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterEstoque} onValueChange={setFilterEstoque}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Estoques</SelectItem>
              {estoques.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <LoadingCardGrid lineWidths={["w-3/4", "w-1/2"]} />
      ) : filteredEPIs.length === 0 ? (
        <EmptyStateCard
          icon={HardHat}
          message={
            searchTerm ? "Nenhum EPI encontrado" : "Nenhum EPI cadastrado"
          }
          actionLabel={!searchTerm ? "Cadastrar Primeiro EPI" : undefined}
          actionIcon={!searchTerm ? Plus : undefined}
          onAction={!searchTerm ? () => setIsOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEPIs.map((epi) => (
            <EPICard
              key={epi.id}
              epi={epi}
              categoryClassName={
                epi.category
                  ? categoriaColors[epi.category] ||
                    "bg-slate-100 text-slate-700"
                  : undefined
              }
              categoryLabel={
                epi.category
                  ? CATEGORIAS.find((item) => item.value === epi.category)
                      ?.label || epi.category
                  : undefined
              }
              onEdit={handleEdit}
              onDelete={async (currentEPI) => {
                if (currentEPI.isActive === false) {
                  toast.info("Este EPI já está inativo.");
                  return;
                }

                try {
                  await updateMutation.mutateAsync({
                    id: currentEPI.id,
                    data: { isActive: false },
                  });
                  toast.success("EPI inativado com sucesso!");
                } catch {
                  toast.error("Não foi possível inativar o EPI.");
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

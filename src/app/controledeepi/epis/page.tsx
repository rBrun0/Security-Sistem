"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  HardHat,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Package,
  DollarSign,
  Calendar,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/src/components/form/form-input";
import { FormSelect } from "@/src/components/form/form-select";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import { toast } from "sonner";
import {
  useCreateEPI,
  useDeleteEPI,
  useEPIs,
  useUpdateEPI,
} from "@/src/app/modules/epis/hooks";
import { EPI } from "@/src/app/modules/epis/types";
import { useCentralWarehouses } from "@/src/app/modules/central-warehouses/hooks";

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

const epiSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  ca: z.string().optional(),
  caValidity: z.string().optional(),
  category: z.string().optional(),
  centralWarehouseId: z.string().optional(),
  quantity: z.coerce.number().min(0),
  unitValue: z.coerce.number().min(0),
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
  const deleteMutation = useDeleteEPI();

  const form = useForm<EPIFormInput, unknown, EPIFormOutput>({
    resolver: zodResolver(epiSchema),
    defaultValues: {
      name: "",
      description: "",
      ca: "",
      caValidity: "",
      category: "",
      centralWarehouseId: "",
      quantity: 0,
      unitValue: 0,
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      ca: "",
      caValidity: "",
      category: "",
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
    } catch {
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
        return matchSearch && matchCategoria && matchEstoque;
      }),
    [epis, filterCategoria, filterEstoque, searchTerm],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">EPIs</h1>
          <p className="text-slate-500 mt-1">
            Gerencie os equipamentos de proteção individual
          </p>
        </div>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingEPI ? "Editar EPI" : "Novo EPI"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormInput
                  name="name"
                  label="Nome do EPI"
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
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="quantity"
                    label="Quantidade em Estoque"
                    type="number"
                    control={form.control}
                  />
                  <FormInput
                    name="unitValue"
                    label="Valor Unitário (R$)"
                    type="number"
                    control={form.control}
                  />
                </div>
                <FormTextarea
                  name="description"
                  label="Descrição"
                  control={form.control}
                />
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
                    className="bg-amber-600 hover:bg-amber-700"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {editingEPI ? "Salvar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEPIs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HardHat className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm ? "Nenhum EPI encontrado" : "Nenhum EPI cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro EPI
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEPIs.map((epi) => (
            <Card
              key={epi.id}
              className="hover:shadow-lg transition-shadow border-0 shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                      <HardHat className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{epi.name}</CardTitle>
                      {epi.category && (
                        <Badge
                          className={
                            categoriaColors[epi.category] ||
                            "bg-slate-100 text-slate-700"
                          }
                        >
                          {CATEGORIAS.find(
                            (item) => item.value === epi.category,
                          )?.label || epi.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(epi)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={async () => {
                          if (!confirm("Deseja excluir este EPI?")) return;
                          try {
                            await deleteMutation.mutateAsync(epi.id);
                            toast.success("EPI excluído com sucesso!");
                          } catch {
                            toast.error("Não foi possível excluir o EPI.");
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {epi.ca && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span>CA: {epi.ca}</span>
                  </div>
                )}
                {epi.caValidity && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Validade: {epi.caValidity}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Package className="w-4 h-4" />
                  <span>Quantidade: {epi.quantity || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <DollarSign className="w-4 h-4" />
                  <span>Valor: R$ {(epi.unitValue || 0).toFixed(2)}</span>
                </div>
                {epi.centralWarehouseName && (
                  <Badge variant="outline" className="mt-2">
                    {epi.centralWarehouseName}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

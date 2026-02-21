"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Warehouse,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  MapPin,
  User,
  Package,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/src/components/form/form-input";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { toast } from "sonner";
import {
  useCentralWarehouses,
  useCreateCentralWarehouse,
  useDeleteCentralWarehouse,
  useUpdateCentralWarehouse,
} from "@/src/app/modules/central-warehouses/hooks";
import { CentralWarehouse } from "@/src/app/modules/central-warehouses/types";
import { useEPIs } from "@/src/app/modules/epis/hooks";
import { Switch } from "@/components/ui/switch";
import { FormSwitch } from "@/src/components/form/form-switch";

const warehouseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  address: z.string().optional(),
  responsible: z.string().optional(),
  isActive: z.boolean(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

export default function Estoques() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] =
    useState<CentralWarehouse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: warehouses = [], isLoading } = useCentralWarehouses();
  const { data: epis = [] } = useEPIs();
  const createMutation = useCreateCentralWarehouse();
  const updateMutation = useUpdateCentralWarehouse();
  const deleteMutation = useDeleteCentralWarehouse();

  const form = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      responsible: "",
      isActive: true,
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      address: "",
      responsible: "",
      isActive: true,
    });
  };

  const onSubmit = async (data: WarehouseFormData) => {
    const payload: Omit<CentralWarehouse, "id"> = data;

    try {
      if (editingWarehouse?.id) {
        await updateMutation.mutateAsync({
          id: editingWarehouse.id,
          data: payload,
        });
        toast.success("Estoque atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Estoque cadastrado com sucesso!");
      }
      setIsOpen(false);
      setEditingWarehouse(null);
      resetForm();
    } catch {
      toast.error("Não foi possível salvar o estoque.");
    }
  };

  const handleEdit = (warehouse: CentralWarehouse) => {
    setEditingWarehouse(warehouse);
    form.reset({
      name: warehouse.name,
      description: warehouse.description ?? "",
      address: warehouse.address ?? "",
      responsible: warehouse.responsible ?? "",
      isActive: warehouse.isActive,
    });
    setIsOpen(true);
  };

  const getEpisCount = (warehouseId: string) => {
    const warehouseEpis = epis.filter(
      (epi) => epi.centralWarehouseId === warehouseId,
    );
    return {
      types: warehouseEpis.length,
      quantity: warehouseEpis.reduce(
        (acc, epi) => acc + (epi.quantity || 0),
        0,
      ),
    };
  };

  const filteredWarehouses = useMemo(
    () =>
      warehouses.filter((warehouse) =>
        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, warehouses],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Estoques Centrais
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os locais de estoque de EPIs
          </p>
        </div>
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
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Estoque
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingWarehouse ? "Editar Estoque" : "Novo Estoque Central"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormInput
                  name="name"
                  label="Nome do Estoque"
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
                    {editingWarehouse ? "Salvar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
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
      ) : filteredWarehouses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Warehouse className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhum estoque encontrado"
                : "Nenhum estoque cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Estoque
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map((warehouse) => {
            const epiInfo = getEpisCount(warehouse.id);

            return (
              <Card
                key={warehouse.id}
                className="hover:shadow-lg transition-shadow border-0 shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          warehouse.isActive ? "bg-amber-100" : "bg-slate-100"
                        }`}
                      >
                        <Warehouse
                          className={`w-6 h-6 ${
                            warehouse.isActive
                              ? "text-amber-600"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {warehouse.name}
                        </CardTitle>
                        <Badge
                          className={
                            warehouse.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }
                        >
                          {warehouse.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" /> Ativo
                            </>
                          ) : (
                            "Inativo"
                          )}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(warehouse)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={async () => {
                            if (!confirm("Deseja excluir este estoque?"))
                              return;
                            try {
                              await deleteMutation.mutateAsync(warehouse.id);
                              toast.success("Estoque excluído com sucesso!");
                            } catch {
                              toast.error(
                                "Não foi possível excluir o estoque.",
                              );
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
                <CardContent className="space-y-3">
                  {warehouse.address && (
                    <div className="flex items-start gap-2 text-sm text-slate-500">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{warehouse.address}</span>
                    </div>
                  )}
                  {warehouse.responsible && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <User className="w-4 h-4" />
                      <span>{warehouse.responsible}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Package className="w-4 h-4" />
                    <span>
                      {epiInfo.types} tipos de EPI • {epiInfo.quantity} unidades
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

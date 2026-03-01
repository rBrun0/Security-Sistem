"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  Search,
  Calendar,
  Package,
  DollarSign,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormSelect } from "@/src/components/form/form-select";
import { FormInput } from "@/src/components/form/form-input";
import { FormDatePicker } from "@/src/components/form/form-date-picker";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { toast } from "sonner";
import {
  useEPIMovements,
  useApplyEPIMovement,
} from "@/src/app/modules/epi-movements/hooks";
import { useEPIs } from "@/src/app/modules/epis/hooks";
import { useCentralWarehouses } from "@/src/app/modules/central-warehouses/hooks";
import { useEnvironments } from "@/src/app/modules/enviroments/hooks";
import { isStockMovementError } from "@/src/app/modules/epi-movements/service";
import { todayLocalISODate } from "@/src/lib/date";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyStateCard,
  LoadingCardGrid,
  PageHeader,
} from "@/src/components/common";

const movementSchema = z.object({
  type: z.enum(["entrada", "saida", "transferencia"], {
    error: "Tipo de movimentação inválido.",
  }),
  epiId: z.string().trim().min(1, "Selecione o EPI."),
  quantity: z.coerce.number().min(1, "A quantidade mínima é 1."),
  originWarehouseId: z.string().optional(),
  destinationWarehouseId: z.string().optional(),
  destinationEnvironmentId: z.string().optional(),
  movementDate: z.string().optional(),
  observation: z.string().trim().optional(),
});

type MovementFormInput = z.input<typeof movementSchema>;
type MovementFormOutput = z.output<typeof movementSchema>;

export default function Movimentacoes() {
  const [isOpen, setIsOpen] = useState(false);
  const [movementType, setMovementType] = useState<
    "entrada" | "saida" | "transferencia"
  >("entrada");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");

  const form = useForm<MovementFormInput, unknown, MovementFormOutput>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: "entrada",
      epiId: "",
      quantity: 1,
      originWarehouseId: "",
      destinationWarehouseId: "",
      destinationEnvironmentId: "",
      movementDate: todayLocalISODate(),
      observation: "",
    },
  });

  const { data: movements = [], isLoading } = useEPIMovements();
  const { data: epis = [] } = useEPIs();
  const { data: warehouses = [] } = useCentralWarehouses();
  const { data: environments = [] } = useEnvironments();

  const applyMovementMutation = useApplyEPIMovement();

  const resetForm = () => {
    form.reset({
      type: "entrada",
      epiId: "",
      quantity: 1,
      originWarehouseId: "",
      destinationWarehouseId: "",
      destinationEnvironmentId: "",
      movementDate: todayLocalISODate(),
      observation: "",
    });
    setMovementType("entrada");
  };

  const onSubmit = async (data: MovementFormOutput) => {
    const epi = epis.find((item) => item.id === data.epiId);

    if (!epi) {
      toast.error("Selecione um EPI válido.");
      return;
    }

    if (movementType === "entrada" && !data.destinationWarehouseId) {
      toast.error("Selecione o estoque de destino.");
      return;
    }

    if (
      movementType === "entrada" &&
      epi.centralWarehouseId &&
      data.destinationWarehouseId &&
      epi.centralWarehouseId !== data.destinationWarehouseId
    ) {
      toast.error(
        "Esse EPI pertence a outro estoque. Para reposição, selecione o mesmo estoque do EPI.",
      );
      return;
    }

    if (movementType === "saida") {
      if (!data.originWarehouseId || !data.destinationEnvironmentId) {
        toast.error("Selecione estoque de origem e ambiente de destino.");
        return;
      }

      if (data.quantity > (epi.quantity || 0)) {
        toast.error("Quantidade indisponível em estoque para saída.");
        return;
      }
    }

    if (movementType === "transferencia") {
      if (!data.originWarehouseId || !data.destinationWarehouseId) {
        toast.error("Selecione estoque de origem e destino.");
        return;
      }

      if (data.originWarehouseId === data.destinationWarehouseId) {
        toast.error("Origem e destino não podem ser iguais.");
        return;
      }

      if (data.quantity > (epi.quantity || 0)) {
        toast.error("Quantidade indisponível em estoque para transferência.");
        return;
      }
    }

    try {
      const originWarehouse = warehouses.find(
        (item) => item.id === data.originWarehouseId,
      );
      const destinationWarehouse = warehouses.find(
        (item) => item.id === data.destinationWarehouseId,
      );
      const destinationEnvironment = environments.find(
        (item) => item.id === data.destinationEnvironmentId,
      );

      await applyMovementMutation.mutateAsync({
        type: movementType,
        epiId: epi.id,
        epiName: epi.name,
        quantity: data.quantity,
        unitValue: epi.unitValue || 0,
        totalValue: (epi.unitValue || 0) * data.quantity,
        originWarehouseId: data.originWarehouseId,
        originWarehouseName: originWarehouse?.name,
        destinationWarehouseId: data.destinationWarehouseId,
        destinationWarehouseName: destinationWarehouse?.name,
        destinationEnvironmentId: data.destinationEnvironmentId,
        destinationEnvironmentName: destinationEnvironment?.name,
        movementDate: data.movementDate,
        observation: data.observation,
      });

      toast.success("Movimentação registrada com sucesso!");
      setIsOpen(false);
      resetForm();
    } catch (error) {
      if (isStockMovementError(error)) {
        toast.error(error.message);
        return;
      }

      toast.error("Não foi possível registrar a movimentação.");
    }
  };

  const filteredMovements = movements.filter((movement) => {
    const matchSearch = movement.epiName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchType = filterType === "todos" || movement.type === filterType;

    return matchSearch && matchType;
  });

  const typeColors: Record<string, string> = {
    entrada: "bg-green-100 text-green-700",
    saida: "bg-red-100 text-red-700",
    transferencia: "bg-blue-100 text-blue-700",
  };

  const typeIcons = {
    entrada: ArrowDownCircle,
    saida: ArrowUpCircle,
    transferencia: ArrowRightLeft,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimentações"
        description="Registre entradas, saídas e transferências de EPIs"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[90vh] max-w-lg flex-col p-0">
              <DialogHeader className="border-b p-6">
                <DialogTitle>Nova Movimentação</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <Tabs
                  value={movementType}
                  onValueChange={(value) => {
                    const next = value as "entrada" | "saida" | "transferencia";
                    setMovementType(next);
                    form.setValue("type", next);
                    form.setValue("originWarehouseId", "");
                    form.setValue("destinationWarehouseId", "");
                    form.setValue("destinationEnvironmentId", "");
                  }}
                  className="space-y-4"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="entrada"
                      className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      Entrada
                    </TabsTrigger>
                    <TabsTrigger
                      value="saida"
                      className="flex items-center gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-700"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      Saída
                    </TabsTrigger>
                    <TabsTrigger
                      value="transferencia"
                      className="flex items-center gap-2"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      Transferência
                    </TabsTrigger>
                  </TabsList>

                  <Form {...form}>
                    <form
                      id="movement-form"
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormSelect
                        name="epiId"
                        label="EPI"
                        control={form.control}
                        options={epis.map((epi) => ({
                          label: `${epi.name} ${epi.ca ? `(CA: ${epi.ca})` : ""}`,
                          value: epi.id,
                        }))}
                      />

                      <FormInput
                        name="quantity"
                        label="Quantidade"
                        type="number"
                        control={form.control}
                      />

                      {movementType === "entrada" && (
                        <FormSelect
                          name="destinationWarehouseId"
                          label="Estoque de Destino"
                          control={form.control}
                          options={warehouses
                            .filter((warehouse) => warehouse.isActive)
                            .map((warehouse) => ({
                              label: warehouse.name,
                              value: warehouse.id,
                            }))}
                        />
                      )}

                      {movementType === "saida" && (
                        <>
                          <FormSelect
                            name="originWarehouseId"
                            label="Estoque de Origem"
                            control={form.control}
                            options={warehouses
                              .filter((warehouse) => warehouse.isActive)
                              .map((warehouse) => ({
                                label: warehouse.name,
                                value: warehouse.id,
                              }))}
                          />
                          <FormSelect
                            name="destinationEnvironmentId"
                            label="Ambiente de Destino"
                            control={form.control}
                            options={environments.map((environment) => ({
                              label: environment.name,
                              value: environment.id,
                            }))}
                          />
                        </>
                      )}

                      {movementType === "transferencia" && (
                        <>
                          <FormSelect
                            name="originWarehouseId"
                            label="Estoque de Origem"
                            control={form.control}
                            options={warehouses
                              .filter((warehouse) => warehouse.isActive)
                              .map((warehouse) => ({
                                label: warehouse.name,
                                value: warehouse.id,
                              }))}
                          />
                          <FormSelect
                            name="destinationWarehouseId"
                            label="Estoque de Destino"
                            control={form.control}
                            options={warehouses
                              .filter((warehouse) => warehouse.isActive)
                              .map((warehouse) => ({
                                label: warehouse.name,
                                value: warehouse.id,
                              }))}
                          />
                        </>
                      )}

                      <FormDatePicker
                        name="movementDate"
                        label="Data da Movimentação"
                        control={form.control}
                      />

                      <FormTextarea
                        name="observation"
                        label="Observação"
                        control={form.control}
                      />
                    </form>
                  </Form>
                </Tabs>
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
                    form="movement-form"
                    className="bg-amber-600 hover:bg-amber-700"
                    disabled={applyMovementMutation.isPending}
                  >
                    Registrar Movimentação
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
            placeholder="Buscar por EPI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select
          onValueChange={(value) => setFilterType(value)}
          value={filterType}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Selecione um tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tipos de Movimentação</SelectLabel>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
              <SelectItem value="transferencia">Transferência</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingCardGrid
          columnsClassName="space-y-4"
          lineWidths={["w-1/2", "w-1/3"]}
        />
      ) : filteredMovements.length === 0 ? (
        <EmptyStateCard
          icon={ArrowRightLeft}
          message={
            searchTerm
              ? "Nenhuma movimentação encontrada"
              : "Nenhuma movimentação registrada"
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredMovements.map((movement) => {
            const TypeIcon = typeIcons[movement.type] || ArrowRightLeft;

            return (
              <Card
                key={movement.id}
                className="border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          movement.type === "entrada"
                            ? "bg-green-100"
                            : movement.type === "saida"
                              ? "bg-red-100"
                              : "bg-blue-100"
                        }`}
                      >
                        <TypeIcon
                          className={`w-6 h-6 ${
                            movement.type === "entrada"
                              ? "text-green-600"
                              : movement.type === "saida"
                                ? "text-red-600"
                                : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800">
                            {movement.epiName}
                          </h3>
                          <Badge className={typeColors[movement.type]}>
                            {movement.type === "entrada"
                              ? "Entrada"
                              : movement.type === "saida"
                                ? "Saída"
                                : "Transferência"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {movement.movementDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {movement.quantity} un
                          </span>
                          {movement.totalValue > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              R$ {movement.totalValue.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {(movement.originWarehouseName ||
                          movement.destinationWarehouseName ||
                          movement.destinationEnvironmentName) && (
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            {movement.originWarehouseName && (
                              <Badge variant="outline">
                                De: {movement.originWarehouseName}
                              </Badge>
                            )}
                            {(movement.destinationWarehouseName ||
                              movement.destinationEnvironmentName) && (
                              <Badge variant="outline">
                                Para:{" "}
                                {movement.destinationWarehouseName ||
                                  movement.destinationEnvironmentName}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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

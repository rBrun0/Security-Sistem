"use client";

import React, { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Plus,
  Package,
  Search,
  Calendar,
  User,
  Building2,
  Link as LinkIcon,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useEmployees } from "@/src/app/modules/employees/hooks";
import { useEnvironments } from "@/src/app/modules/enviroments/hooks";
import { useEPIs, useUpdateEPI } from "@/src/app/modules/epis/hooks";
import {
  useEPIDeliveries,
  useCreateEPIDelivery,
} from "@/src/app/modules/epi-deliveries/hooks";
import { useCreateEPIMovement } from "@/src/app/modules/epi-movements/hooks";

const deliverySchema = z.object({
  employeeId: z.string().min(1, "Selecione o colaborador."),
  environmentId: z.string().min(1, "Selecione o ambiente."),
  deliveryResponsible: z.string().trim().min(1, "Informe o responsável."),
  items: z
    .array(
      z.object({
        epiId: z.string().min(1, "Selecione o EPI."),
        quantity: z.coerce.number().min(1, "Quantidade mínima é 1."),
      }),
    )
    .min(1, "Adicione ao menos um EPI."),
});

type DeliveryFormInput = z.input<typeof deliverySchema>;
type DeliveryFormOutput = z.output<typeof deliverySchema>;

export default function EntregasEPIPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEnvironment, setFilterEnvironment] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todos");

  const { data: deliveries = [], isLoading } = useEPIDeliveries();
  const { data: employees = [] } = useEmployees();
  const { data: environments = [] } = useEnvironments();
  const { data: epis = [] } = useEPIs();

  const createDeliveryMutation = useCreateEPIDelivery();
  const createMovementMutation = useCreateEPIMovement();
  const updateEPIMutation = useUpdateEPI();

  const form = useForm<DeliveryFormInput, unknown, DeliveryFormOutput>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      employeeId: "",
      environmentId: "",
      deliveryResponsible: "",
      items: [{ epiId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });

  const resetForm = () => {
    form.reset({
      employeeId: "",
      environmentId: "",
      deliveryResponsible: "",
      items: [{ epiId: "", quantity: 1 }],
    });
  };

  const generateSignatureToken = (tokenBase: string) =>
    tokenBase
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

  const onSubmit = async (data: DeliveryFormOutput) => {
    const employee = employees.find((item) => item.id === data.employeeId);
    const environment = environments.find(
      (item) => item.id === data.environmentId,
    );

    if (!employee || !environment) {
      toast.error("Selecione colaborador e ambiente.");
      return;
    }

    const normalizedItems = data.items
      .map((item) => {
        const epi = epis.find((entry) => entry.id === item.epiId);
        if (!epi) return null;

        return {
          epi,
          quantity: Number(item.quantity || 0),
        };
      })
      .filter(
        (item): item is { epi: (typeof epis)[number]; quantity: number } =>
          Boolean(item),
      );

    if (normalizedItems.length === 0) {
      toast.error("Adicione pelo menos um EPI válido.");
      return;
    }

    const hasInvalidQuantity = normalizedItems.some(
      ({ epi, quantity }) => quantity <= 0 || quantity > (epi.quantity || 0),
    );

    if (hasInvalidQuantity) {
      toast.error("Quantidade inválida para um ou mais EPIs.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const signatureToken = generateSignatureToken(
      `${employee.id}-${environment.id}-${today}-${normalizedItems
        .map(({ epi, quantity }) => `${epi.id}:${quantity}`)
        .join("_")}`,
    );

    try {
      await createDeliveryMutation.mutateAsync({
        employeeId: employee.id,
        employeeName: employee.name,
        employeeCpf: employee.cpf,
        environmentId: environment.id,
        environmentName: environment.name,
        items: normalizedItems.map(({ epi, quantity }) => ({
          epiId: epi.id,
          epiName: epi.name,
          ca: epi.ca,
          quantity,
          unitValue: epi.unitValue || 0,
        })),
        deliveryDate: today,
        deliveryResponsible: data.deliveryResponsible,
        signatureToken,
        status: "pendente",
      });

      for (const { epi, quantity } of normalizedItems) {
        await createMovementMutation.mutateAsync({
          type: "saida",
          epiId: epi.id,
          epiName: epi.name,
          quantity,
          unitValue: epi.unitValue || 0,
          totalValue: (epi.unitValue || 0) * quantity,
          originWarehouseId: epi.centralWarehouseId,
          originWarehouseName: epi.centralWarehouseName,
          destinationEnvironmentId: environment.id,
          destinationEnvironmentName: environment.name,
          movementDate: today,
          observation: `Entrega de EPI para ${employee.name}`,
        });

        await updateEPIMutation.mutateAsync({
          id: epi.id,
          data: {
            quantity: Math.max(0, (epi.quantity || 0) - quantity),
          },
        });
      }

      toast.success("Entrega registrada com sucesso!");
      setIsOpen(false);
      resetForm();
    } catch {
      toast.error("Não foi possível registrar a entrega.");
    }
  };

  const generateSignatureLink = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/controledeepi/entregas/assinatura?token=${token}&tipo=trabalhador`;
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const filteredDeliveries = useMemo(
    () =>
      deliveries.filter((delivery) => {
        const matchSearch = delivery.employeeName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchEnvironment =
          filterEnvironment === "todas" ||
          delivery.environmentId === filterEnvironment;
        const matchStatus =
          filterStatus === "todos" || delivery.status === filterStatus;

        return matchSearch && matchEnvironment && matchStatus;
      }),
    [deliveries, filterEnvironment, filterStatus, searchTerm],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Entregas de EPI</h1>
          <p className="text-slate-500 mt-1">
            Registre e gerencie entregas de EPIs aos trabalhadores
          </p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Entrega
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Entrega de EPI</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Colaborador *</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees
                              .filter(
                                (employee) => employee.status === "active",
                              )
                              .map((employee) => (
                                <SelectItem
                                  key={employee.id}
                                  value={employee.id}
                                >
                                  {employee.name} - {employee.cpf}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ambiente (Obra) *</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {environments.map((environment) => (
                              <SelectItem
                                key={environment.id}
                                value={environment.id}
                              >
                                {environment.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="deliveryResponsible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável pela Entrega</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nome de quem está entregando"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>EPIs a Entregar</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ epiId: "", quantity: 1 })}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar EPI
                    </Button>
                  </div>

                  {fields.map((field, index) => {
                    const selectedEpiId = watchedItems?.[index]?.epiId;
                    const selectedEpi = epis.find(
                      (epi) => epi.id === selectedEpiId,
                    );

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="col-span-5">
                          <FormField
                            control={form.control}
                            name={`items.${index}.epiId` as const}
                            render={({ field: itemField }) => (
                              <FormItem>
                                <FormLabel className="text-xs">EPI</FormLabel>
                                <Select
                                  value={itemField.value || undefined}
                                  onValueChange={itemField.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {epis.map((epi) => (
                                      <SelectItem key={epi.id} value={epi.id}>
                                        {epi.name} {epi.ca && `(CA: ${epi.ca})`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-3">
                          <Label className="text-xs">CA</Label>
                          <Input
                            value={selectedEpi?.ca || ""}
                            disabled
                            className="bg-white"
                          />
                        </div>

                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity` as const}
                            render={({ field: itemField }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Qtd</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={selectedEpi?.quantity || undefined}
                                    value={Number(itemField.value ?? 1)}
                                    onChange={(e) =>
                                      itemField.onChange(
                                        Math.max(
                                          1,
                                          Number(e.target.value) || 1,
                                        ),
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-2 flex items-end justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
                      createDeliveryMutation.isPending ||
                      createMovementMutation.isPending ||
                      updateEPIMutation.isPending
                    }
                  >
                    Registrar Entrega
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
            placeholder="Buscar por trabalhador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        <Select value={filterEnvironment} onValueChange={setFilterEnvironment}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos Ambientes</SelectItem>
            {environments.map((environment) => (
              <SelectItem key={environment.id} value={environment.id}>
                {environment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="assinado">Assinado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhuma entrega encontrada"
                : "Nenhuma entrega registrada"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => (
            <Card
              key={delivery.id}
              className="border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        delivery.status === "assinado"
                          ? "bg-green-100"
                          : "bg-amber-100"
                      }`}
                    >
                      {delivery.status === "assinado" ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-slate-800">
                          {delivery.employeeName}
                        </h3>
                        <Badge
                          className={
                            delivery.status === "assinado"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        >
                          {delivery.status === "assinado"
                            ? "Assinado"
                            : "Pendente"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          CPF: {delivery.employeeCpf}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {delivery.environmentName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {delivery.deliveryDate}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {delivery.items?.map((item, index) => (
                          <Badge key={index} variant="outline">
                            {item.epiName} x{item.quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {delivery.status !== "assinado" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyLink(
                            generateSignatureLink(delivery.signatureToken),
                          )
                        }
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Link Assinatura
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

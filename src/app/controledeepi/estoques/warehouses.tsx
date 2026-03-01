"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Warehouse, Search } from "lucide-react";
import { toast } from "sonner";
import {
  useCentralWarehouses,
  useUpdateCentralWarehouse,
} from "@/src/app/modules/central-warehouses/hooks";
import { CentralWarehouse } from "@/src/app/modules/central-warehouses/types";
import { useEPIs, useUpdateEPI } from "@/src/app/modules/epis/hooks";
import { WarehouseCard } from "@/components/domains/card-warehouse";
import { EmptyStateCard, LoadingCardGrid } from "@/src/components/common";

type WarehousesProps = {
  setIsOpen: (isOpen: boolean) => void;
  setEditingWarehouse: Dispatch<SetStateAction<CentralWarehouse | null>>;
};

export const Warehouses = ({
  setIsOpen,
  setEditingWarehouse,
}: WarehousesProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: warehouses = [], isLoading } = useCentralWarehouses();
  const { data: epis = [] } = useEPIs();
  const updateWarehouseMutation = useUpdateCentralWarehouse();
  const updateEPIMutation = useUpdateEPI();

  const getEpisCount = (warehouseId: string) => {
    const warehouseEpis = epis.filter(
      (epi) => epi.centralWarehouseId === warehouseId && epi.isActive !== false,
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
    <>
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
        <LoadingCardGrid lineWidths={["w-3/4", "w-1/2"]} />
      ) : filteredWarehouses.length === 0 ? (
        <EmptyStateCard
          icon={Warehouse}
          message={
            searchTerm
              ? "Nenhum estoque encontrado"
              : "Nenhum estoque cadastrado"
          }
          actionLabel={!searchTerm ? "Cadastrar Primeiro Estoque" : undefined}
          actionIcon={!searchTerm ? Plus : undefined}
          onAction={!searchTerm ? () => setIsOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map((warehouse) => {
            const epiInfo = getEpisCount(warehouse.id);

            return (
              <WarehouseCard
                key={warehouse.id}
                warehouse={warehouse}
                epiTypes={epiInfo.types}
                epiQuantity={epiInfo.quantity}
                onEdit={(currentWarehouse) => {
                  setEditingWarehouse(currentWarehouse);
                  setIsOpen(true);
                }}
                onDelete={async (currentWarehouse) => {
                  if (!currentWarehouse.isActive) {
                    toast.info("Este estoque já está inativo.");
                    return;
                  }

                  const linkedActiveEpis = epis.filter(
                    (epi) =>
                      epi.centralWarehouseId === currentWarehouse.id &&
                      epi.isActive !== false,
                  );

                  try {
                    await updateWarehouseMutation.mutateAsync({
                      id: currentWarehouse.id,
                      data: { isActive: false },
                    });

                    if (linkedActiveEpis.length) {
                      await Promise.all(
                        linkedActiveEpis.map((epi) =>
                          updateEPIMutation.mutateAsync({
                            id: epi.id,
                            data: { isActive: false },
                          }),
                        ),
                      );
                    }

                    toast.success("Estoque inativado com sucesso!");
                  } catch {
                    toast.error("Não foi possível inativar o estoque.");
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

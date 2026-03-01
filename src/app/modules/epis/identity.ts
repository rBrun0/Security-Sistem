import { EPI } from "./types";

function normalizeIdentityValue(value?: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function buildEPIIdentityKey(
  epi: Pick<EPI, "name" | "ca" | "centralWarehouseId">,
): string {
  const warehouseId = normalizeIdentityValue(epi.centralWarehouseId);
  const name = normalizeIdentityValue(epi.name);
  const ca = normalizeIdentityValue(epi.ca);

  return `${warehouseId}::${name}::${ca}`;
}

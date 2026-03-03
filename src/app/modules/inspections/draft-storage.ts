const INSPECTION_DRAFT_STORAGE_KEY = "inspections:create:draft-id";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getInspectionDraftIdFromStorage(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return localStorage.getItem(INSPECTION_DRAFT_STORAGE_KEY);
}

export function setInspectionDraftIdInStorage(id: string) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(INSPECTION_DRAFT_STORAGE_KEY, id);
}

export function clearInspectionDraftIdFromStorage() {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(INSPECTION_DRAFT_STORAGE_KEY);
}

export function isInspectionCreatePath(pathname: string) {
  return pathname === "/inspecao/inspecoes/nova";
}

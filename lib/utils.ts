import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createPageUrl(pageName: string) {
  return "/" + pageName.replace(/ /g, "-");
}

export function removeUndefinedFields<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  ) as T;
}

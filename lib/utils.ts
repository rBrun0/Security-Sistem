import { clsx, type ClassValue } from "clsx";
import { parsePhoneNumber, isValidPhoneNumber } from "react-phone-number-input";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createPageUrl(pageName: string) {
  return "/" + pageName.replace(/ /g, "-");
}

export function plural(
  count: number,
  singular: string,
  pluralForm?: string,
): string {
  return count === 1 ? singular : (pluralForm ?? `${singular}s`);
}

export function removeUndefinedFields<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as T;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function hasOnlyDigits(value: string): boolean {
  return /^\d+$/.test(value);
}

export function isNumericValue(value: string, minLength = 1): boolean {
  const clean = onlyDigits(value);
  return clean.length >= minLength && hasOnlyDigits(clean);
}

export function normalizePhoneToE164(phone?: string | null): string | null {
  if (!phone) return null;

  try {
    const parsed = parsePhoneNumber(phone);
    return parsed?.number || null;
  } catch {
    return null;
  }
}

export function normalizeOptionalPhoneValue(
  phone?: string | null,
): string | undefined {
  const normalized = normalizePhoneToE164(phone);
  return normalized ?? undefined;
}

export function formatPhoneForDisplay(phone?: string | null): string {
  if (!phone) return "";

  try {
    const parsed = parsePhoneNumber(phone);
    return parsed?.formatNational() || phone;
  } catch {
    return phone;
  }
}

export function isValidPhone(phone?: string | null): boolean {
  if (!phone) return false;

  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
}

export function isOptionalValidPhone(phone?: string | null): boolean {
  if (!phone) return true;
  return isValidPhone(phone);
}

export function isValidCPF(cpf: string): boolean {
  const clean = onlyDigits(cpf);

  if (clean.length !== 11) return false;

  if (/^(\d)\1+$/.test(clean)) return false;

  const digits = clean.split("").map(Number);

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }

  let firstVerifier = (sum * 10) % 11;
  if (firstVerifier === 10) firstVerifier = 0;

  if (firstVerifier !== digits[9]) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }

  let secondVerifier = (sum * 10) % 11;
  if (secondVerifier === 10) secondVerifier = 0;

  return secondVerifier === digits[10];
}

export function formatCPFForDisplay(cpf?: string | null): string {
  if (!cpf) return "";

  const clean = onlyDigits(cpf);
  if (clean.length !== 11) return cpf;

  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function isValidCNPJ(cnpj: string): boolean {
  const clean = onlyDigits(cnpj);

  if (clean.length !== 14) return false;
  if (/^(\d)\1+$/.test(clean)) return false;

  const digits = clean.split("").map(Number);

  const calculateVerifier = (length: number) => {
    let sum = 0;
    let weight = length - 7;

    for (let i = 0; i < length; i++) {
      sum += digits[i] * weight--;
      if (weight < 2) weight = 9;
    }

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstVerifier = calculateVerifier(12);
  if (firstVerifier !== digits[12]) return false;

  const secondVerifier = calculateVerifier(13);
  return secondVerifier === digits[13];
}

type PastelColorOptions = {
  saturation?: number;
  lightness?: number;
  alpha?: number;
};

type PastelPaletteOptions = PastelColorOptions & {
  seed?: number | string;
};

type BadgeColorStyle = {
  backgroundColor: string;
  color: string;
  borderColor: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

export function hashTextToNumber(text: string): number {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function genPastelColor(
  hue: number,
  options: PastelColorOptions = {},
): string {
  const saturation = clamp(options.saturation ?? 65, 0, 100);
  const lightness = clamp(options.lightness ?? 85, 0, 100);
  const alpha = clamp(options.alpha ?? 1, 0, 1);

  return `hsl(${normalizeHue(hue)} ${saturation}% ${lightness}% / ${alpha})`;
}

export function genPastelColors(
  count: number,
  options: PastelPaletteOptions = {},
): string[] {
  const total = Math.max(0, Math.floor(count));
  if (total === 0) return [];

  const seedBase =
    typeof options.seed === "string"
      ? hashTextToNumber(options.seed)
      : Math.abs(options.seed ?? 0);

  const startHue = normalizeHue(seedBase % 360);
  const goldenAngle = 137.508;

  return Array.from({ length: total }, (_, index) =>
    genPastelColor(startHue + index * goldenAngle, options),
  );
}

export function genPastelColorFromText(
  text: string,
  options: PastelColorOptions = {},
): string {
  return genPastelColor(hashTextToNumber(text), options);
}

export function genBadgeColorFromText(
  text: string,
  options: PastelColorOptions = {},
): BadgeColorStyle {
  const hue = hashTextToNumber(text);
  const backgroundColor = genPastelColor(hue, options);
  const borderColor = genPastelColor(hue, {
    saturation: (options.saturation ?? 65) + 5,
    lightness: (options.lightness ?? 85) - 10,
    alpha: options.alpha ?? 1,
  });
  const color = genPastelColor(hue, {
    saturation: (options.saturation ?? 65) + 15,
    lightness: 30,
    alpha: 1,
  });

  return {
    backgroundColor,
    borderColor,
    color,
  };
}

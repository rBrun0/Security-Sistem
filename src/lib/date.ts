import { isValid, parse } from "date-fns";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDateToLocalISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
}

export function todayLocalISODate(): string {
  return formatDateToLocalISO(new Date());
}

export function normalizeDateInputToLocalISO(
  value: string | Date | null | undefined,
): string | undefined {
  if (!value) return undefined;

  if (value instanceof Date) {
    return isValid(value) ? formatDateToLocalISO(value) : undefined;
  }

  const input = value.trim();
  if (!input) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  const parsedPtBr = parse(input, "dd/MM/yyyy", new Date());
  if (isValid(parsedPtBr)) return formatDateToLocalISO(parsedPtBr);

  const parsedJsDate = new Date(input);
  return isValid(parsedJsDate) ? formatDateToLocalISO(parsedJsDate) : undefined;
}

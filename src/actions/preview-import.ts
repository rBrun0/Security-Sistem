import * as XLSX from "xlsx";
import { z } from "zod";

const epiImportSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do EPI."),
  description: z.string().trim().optional(),
  ca: z.string().trim().optional(),
  caValidity: z.string().optional(),
  category: z.string().optional(),
  quantity: z.coerce.number().min(0, "A quantidade não pode ser negativa."),
  usageTime: z.coerce
    .number()
    .min(1, "O tempo de uso deve ser pelo menos 1 dia."),
  unitValue: z.coerce
    .number()
    .min(0, "O valor unitário não pode ser negativo."),
});

export type ImportedEpiRow = z.infer<typeof epiImportSchema>;

type RowErrors = {
  rowIndex: number;
  row: unknown;
  errors: string[];
};

const normalizeHeader = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]/g, "")
    .trim()
    .toLowerCase();

const toNumberSafe = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return value;

  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number(normalized);

  return Number.isNaN(parsed) ? value : parsed;
};

const normalizeEpiRow = (row: Record<string, unknown>) => {
  const normalizedEntries = Object.entries(row).map(([key, value]) => [
    normalizeHeader(key),
    value,
  ]);

  const map = Object.fromEntries(normalizedEntries);

  return {
    name: map.nome ?? map.name ?? "",
    description: map.descricao ?? map.description ?? "",
    ca: map.ca ?? "",
    caValidity: map.validadeca ?? map.cavalidity ?? "",
    category: map.categoria ?? map.category ?? "",
    quantity: toNumberSafe(map.quantidade ?? map.quantity ?? 0),
    usageTime: toNumberSafe(map.tempodeuso ?? map.usagetime ?? 1),
    unitValue: toNumberSafe(map.valorunitario ?? map.unitvalue ?? 0),
  };
};

export const PreviewEpiImport = async (file: File) => {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return {
      validRows: [] as ImportedEpiRow[],
      invalidRows: [] as RowErrors[],
    };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const validRows: ImportedEpiRow[] = [];
  const invalidRows: RowErrors[] = [];

  data.forEach((row, index) => {
    const parsed = epiImportSchema.safeParse(normalizeEpiRow(row));

    if (parsed.success) {
      validRows.push(parsed.data);
      return;
    }

    invalidRows.push({
      rowIndex: index + 2,
      row,
      errors: parsed.error.issues.map((issue) => issue.message),
    });
  });

  return { validRows, invalidRows };
};

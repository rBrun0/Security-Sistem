"use client";

import { IMaskInput } from "react-imask";
import { Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type FormDocumentInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  documentType?: "cpf" | "cnpj";
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  onChange?: (value: string) => void;
};

export function FormDocumentInput<T extends FieldValues>({
  name,
  control,
  label,
  documentType = "cpf",
  placeholder = "000.000.000-00",
  className,
  containerClassName,
  onChange,
}: FormDocumentInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`relative ${containerClassName ?? ""}`}>
          {label && <FormLabel>{label}</FormLabel>}

          <FormControl>
            <IMaskInput
              mask={
                documentType === "cnpj"
                  ? "00.000.000/0000-00"
                  : "000.000.000-00"
              }
              value={(field.value as string | undefined) ?? ""}
              onAccept={(value) => {
                const parsedValue = String(value ?? "");
                field.onChange(parsedValue);
                onChange?.(parsedValue);
              }}
              onBlur={field.onBlur}
              inputRef={field.ref}
              name={field.name}
              placeholder={placeholder}
              className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className,
              )}
            />
          </FormControl>
          <FormMessage className="absolute right-0 top-full mt-1 text-xs" />
        </FormItem>
      )}
    />
  );
}

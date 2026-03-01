"use client";

import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Control, FieldValues, Path } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

type FormDatePickerProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
};

function parseDateValue(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return isValid(value) ? value : undefined;
  }

  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;

  const parsedIso = parse(normalized, "yyyy-MM-dd", new Date());
  if (isValid(parsedIso)) return parsedIso;

  const parsedPtBr = parse(normalized, "dd/MM/yyyy", new Date());
  if (isValid(parsedPtBr)) return parsedPtBr;

  return undefined;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Selecione uma data",
}: FormDatePickerProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const parsedDate = parseDateValue(field.value);

        return (
          <FormItem className="relative flex flex-col">
            {label && <FormLabel>{label}</FormLabel>}

            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !parsedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {parsedDate
                      ? format(parsedDate, "dd/MM/yyyy", {
                          locale: ptBR,
                        })
                      : placeholder}
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parsedDate}
                  onSelect={(date) => {
                    if (!date) return;

                    field.onChange(format(date, "yyyy-MM-dd"));
                  }}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <FormMessage className="absolute right-0 top-full mt-1 text-xs" />
          </FormItem>
        );
      }}
    />
  );
}

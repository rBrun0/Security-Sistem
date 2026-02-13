"use client";

import * as React from "react";
import { format } from "date-fns";
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
      render={({ field }) => (
        <FormItem className="flex flex-col">
          {label && <FormLabel>{label}</FormLabel>}

          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value
                    ? format(field.value, "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    : placeholder}
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

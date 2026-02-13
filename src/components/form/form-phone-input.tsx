"use client";

import PhoneInput from "react-phone-number-input";
import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

type FormPhoneInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  className?: string;
  containerClassName?: string;
};

export function FormPhoneInput<T extends FieldValues>({
  name,
  control,
  label,
  className,
  containerClassName,
}: FormPhoneInputProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={containerClassName}>
          {label && <FormLabel>{label}</FormLabel>}

          <PhoneInput
            {...field}
            defaultCountry="BR"
            className={cn(
              "flex h-10! rounded-md border border-input bg-background px-3 w-full min-w-0",
              className,
            )}
          />

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

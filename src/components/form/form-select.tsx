import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  triggerClassName,
  containerClassName,
  onValueChange,
  disabled,
}: {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: Option[];
  placeholder?: string;
  triggerClassName?: string;
  containerClassName?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`relative ${containerClassName ?? ""}`}>
          {label && <FormLabel>{label}</FormLabel>}

          <Select
            onValueChange={(value) => {
              field.onChange(value);
              onValueChange?.(value);
            }}
            value={field.value || undefined}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger
                className={cn("w-full", triggerClassName)}
                disabled={disabled}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FormMessage className="absolute right-0 top-full mt-1 text-xs" />
        </FormItem>
      )}
    />
  );
}

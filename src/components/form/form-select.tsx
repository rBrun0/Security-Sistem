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
}: {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: Option[];
  placeholder?: string;
  triggerClassName?: string;
  containerClassName?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={containerClassName}>
          {label && <FormLabel>{label}</FormLabel>}

          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className={cn("w-full", triggerClassName)}>
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

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

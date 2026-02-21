import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Control, FieldValues, Path } from "react-hook-form";

type FormInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  containerClassName?: string;
  onChange?: (...event: unknown[]) => void;
};

export function FormSwitch<T extends FieldValues>({
  name,
  control,
  label,
  className,
  containerClassName,
  onChange,
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={containerClassName}>
          {label && <FormLabel>{label}</FormLabel>}

          <FormControl>
            <Switch
              className={className}
              checked={field.value}
              onCheckedChange={(value) => {
                field.onChange(value);
                onChange?.(value);
              }}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

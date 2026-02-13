import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, FieldValues, Path } from "react-hook-form";

type FormInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  containerClassName?: string;
};

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = "text",
  className,
  containerClassName,
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={containerClassName}>
          {label && <FormLabel>{label}</FormLabel>}

          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              className={className}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

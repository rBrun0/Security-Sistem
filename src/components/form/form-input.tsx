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
  onChange?: (...event: unknown[]) => void;
};

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = "text",
  className,
  containerClassName,
  onChange,
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`relative ${containerClassName ?? ""}`}>
          {label && <FormLabel>{label}</FormLabel>}

          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              className={className}
              onChange={(e) => {
                field.onChange(e);
                onChange?.(e.target.value);
              }}
            />
          </FormControl>

          <FormMessage className="absolute right-0 top-full mt-1 text-xs" />
        </FormItem>
      )}
    />
  );
}

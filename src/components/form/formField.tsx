import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Input } from "./input";

type FormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  ...props
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          {...props}
          label={label}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

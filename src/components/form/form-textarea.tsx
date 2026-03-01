import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

export function FormTextarea<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
}: {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="relative">
          {label && <FormLabel>{label}</FormLabel>}

          <FormControl>
            <Textarea {...field} placeholder={placeholder} />
          </FormControl>

          <FormMessage className="absolute right-0 top-full mt-1 text-xs" />
        </FormItem>
      )}
    />
  );
}

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

export function FormCheckbox<T extends FieldValues>({
  name,
  control,
  label,
}: {
  name: Path<T>;
  control: Control<T>;
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="relative flex items-start gap-3">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>

          <FormLabel className="font-normal">{label}</FormLabel>

          <FormMessage className="absolute right-0 top-full mt-1 text-xs" />
        </FormItem>
      )}
    />
  );
}

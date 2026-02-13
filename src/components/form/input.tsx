import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label>{label}</Label>}
      <input
        type="text"
        className={cn(
          "h-10 rounded-md border px-3 text-sm outline-none",
          "border-zinc-300 focus:border-zinc-900",
          error && "border-red-500",
          className,
        )}
        {...props}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

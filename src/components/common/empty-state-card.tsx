import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

type EmptyStateCardProps = {
  icon: LucideIcon;
  message: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
};

export function EmptyStateCard({
  icon: Icon,
  message,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}: EmptyStateCardProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className="mb-4 h-12 w-12 text-slate-300" />
        <p className="text-center text-slate-500">{message}</p>
        {actionLabel && onAction && (
          <Button variant="outline" className="mt-4" onClick={onAction}>
            {ActionIcon ? <ActionIcon className="mr-2 h-4 w-4" /> : null}
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

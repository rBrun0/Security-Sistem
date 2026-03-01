import { Card, CardContent } from "@/components/ui/card";

type LoadingCardGridProps = {
  count?: number;
  columnsClassName?: string;
  lineWidths?: string[];
};

export function LoadingCardGrid({
  count = 3,
  columnsClassName = "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
  lineWidths = ["w-3/4", "w-1/2"],
}: LoadingCardGridProps) {
  return (
    <div className={columnsClassName}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-6">
            {lineWidths.map((width, lineIndex) => (
              <div
                key={lineIndex}
                className={`h-4 rounded bg-slate-200 ${width} ${lineIndex === 0 ? "mb-4 h-6" : "mb-2 last:mb-0"}`}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

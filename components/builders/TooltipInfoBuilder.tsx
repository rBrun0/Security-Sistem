"use client";

import { ReactNode } from "react";
import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";
import { TooltipBuilder } from "./TooltipBuilder";

interface TooltipInfoBuilderProps {
  content: ReactNode;
  iconClassName?: string;
  wrapperClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  delayDuration?: number;
  contentClassName?: string;
  ariaLabel?: string;
}

export const TooltipInfoBuilder = ({
  content,
  iconClassName,
  wrapperClassName,
  side,
  sideOffset,
  delayDuration,
  contentClassName,
  ariaLabel = "Informações",
}: TooltipInfoBuilderProps) => {
  return (
    <TooltipBuilder
      content={content}
      side={side}
      sideOffset={sideOffset}
      delayDuration={delayDuration}
      contentClassName={contentClassName}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors",
          wrapperClassName,
        )}
        aria-label={ariaLabel}
      >
        <CircleHelp className={cn("h-4 w-4", iconClassName)} />
      </button>
    </TooltipBuilder>
  );
};

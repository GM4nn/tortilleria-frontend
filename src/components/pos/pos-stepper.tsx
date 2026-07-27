"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function PosStepper({
  steps,
  current,
  onSelect,
}: {
  steps: string[];
  current: number;
  onSelect?: (index: number) => void;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {steps.map((label, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect?.(index)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : done
                  ? "border-primary/40 text-primary"
                  : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-xs",
                active || done ? "border-current" : "border-muted-foreground/40"
              )}
            >
              {done ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

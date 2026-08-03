"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DatePicker({
  value,
  onChange,
  placeholder,
  className,
}: {
  value?: string;
  onChange: (value?: string) => void;
  placeholder?: string;
  className?: string;
}) {
  // Input de fecha nativo: funciona bien en iPad/móvil y usa el formato yyyy-MM-dd.
  // appearance-none evita que iOS ignore width:100% y desborde el input.
  return (
    <Input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      aria-label={placeholder}
      className={cn("h-9 w-full min-w-0 appearance-none", className)}
    />
  );
}

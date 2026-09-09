"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDealers } from "@/features/dealers/hooks";
import { useSaveRoute } from "../hooks";
import type { Route } from "../types";

const COLORS = ["#ff4d6d", "#f77f00", "#4cc9f0", "#a78bfa", "#2ecc71", "#f1c40f"];
const NONE = "__none__";

const EMPTY = { name: "", color: COLORS[0], dealer_username: "" };

export function RouteFormDialog({
  open,
  onOpenChange,
  route,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: Route | null;
}) {
  const [form, setForm] = useState(EMPTY);
  const save = useSaveRoute();
  const { data: dealers } = useDealers();

  useEffect(() => {
    if (open) {
      setForm(
        route
          ? {
              name: route.name,
              color: route.color ?? COLORS[0],
              dealer_username: route.dealer_username ?? "",
            }
          : EMPTY
      );
    }
  }, [open, route]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    save.mutate(
      {
        id: route?.id,
        data: {
          name: form.name,
          color: form.color,
          dealer_username: form.dealer_username || null,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{route ? "Editar ruta" : "Nueva ruta"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="route_name">Nombre de la zona</Label>
            <Input
              id="route_name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Centro, Norte, Colonia Jardín"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                    form.color === c ? "border-foreground" : "border-transparent"
                  )}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Repartidor asignado</Label>
            <Select
              value={form.dealer_username || NONE}
              onValueChange={(v) =>
                setForm({ ...form, dealer_username: v === NONE ? "" : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sin asignar</SelectItem>
                {dealers?.map((d) => (
                  <SelectItem key={d.username} value={d.username}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

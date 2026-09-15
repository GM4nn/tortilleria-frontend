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
import { cn } from "@/lib/utils";
import { useDealers } from "@/features/dealers/hooks";
import { useSaveRoute } from "../hooks";
import type { Route } from "../types";

const COLORS = ["#ff4d6d", "#f77f00", "#4cc9f0", "#a78bfa", "#2ecc71", "#f1c40f"];

const EMPTY = { name: "", color: COLORS[0], dealers: [] as string[] };

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
              dealers: route.dealers ?? [],
            }
          : EMPTY
      );
    }
  }, [open, route]);

  const toggleDealer = (username: string) =>
    setForm((f) => ({
      ...f,
      dealers: f.dealers.includes(username)
        ? f.dealers.filter((d) => d !== username)
        : [...f.dealers, username],
    }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    save.mutate(
      {
        id: route?.id,
        data: {
          name: form.name,
          color: form.color,
          dealers: form.dealers,
          dealer_username: form.dealers[0] ?? null,
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
            <Label>Repartidores</Label>
            <p className="text-xs text-muted-foreground">
              Puedes asignar varios. Con uno solo, los pedidos se le asignan
              automáticamente; con varios, quedan sin asignar y cualquiera de la
              ruta puede tomarlos.
            </p>
            <div className="max-h-44 space-y-1 overflow-y-auto rounded-md border p-1">
              {dealers?.length ? (
                dealers.map((d) => {
                  const checked = form.dealers.includes(d.username);
                  return (
                    <button
                      key={d.username}
                      type="button"
                      onClick={() => toggleDealer(d.username)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                        checked && "bg-accent"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input"
                        )}
                      >
                        {checked ? "✓" : ""}
                      </span>
                      {d.name}
                    </button>
                  );
                })
              ) : (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                  No hay repartidores.
                </p>
              )}
            </div>
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

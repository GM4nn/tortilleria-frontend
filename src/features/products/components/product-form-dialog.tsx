"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMeta } from "@/features/meta/hooks";
import { useSaveProduct } from "../hooks";
import type { Product } from "../types";

const EMPTY = { icon: "🍴", name: "", price: "" };

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}) {
  const [form, setForm] = useState(EMPTY);
  const save = useSaveProduct();
  const { data: meta } = useMeta();

  useEffect(() => {
    if (open) {
      setForm(
        product
          ? { icon: product.icon, name: product.name, price: String(product.price) }
          : EMPTY
      );
    }
  }, [open, product]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    save.mutate(
      {
        id: product?.id,
        data: { icon: form.icon, name: form.name, price: Number(form.price) },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="min-w-0 space-y-4">
          <div className="flex gap-4">
            {/* IZQUIERDA: nombre + precio apilados */}
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  className="w-full min-w-0"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full min-w-0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* DERECHA: selector de icono, exactamente a la altura de nombre + precio */}
            <div className="relative min-w-0 flex-1">
              <div className="absolute inset-0 flex flex-col">
                <Label className="mb-2">Icono</Label>
                <div className="grid min-h-0 flex-1 grid-cols-5 content-start gap-2 overflow-y-auto rounded-md border p-2">
                  {(meta?.product_icons ?? []).map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-md border text-xl transition-colors",
                        form.icon === icon
                          ? "border-primary bg-accent ring-2 ring-primary"
                          : "hover:bg-accent"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTONES: al lado del icono, apilados y repartiendo la altura 50/50 */}
            <div className="flex w-32 shrink-0 flex-col gap-2">
              <Button type="submit" className="h-auto flex-1" disabled={save.isPending}>
                {save.isPending ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

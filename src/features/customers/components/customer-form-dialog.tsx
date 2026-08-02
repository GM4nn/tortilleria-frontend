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
import { CUSTOMER_CATEGORY_MOSTRADOR, useMeta } from "@/features/meta/hooks";
import { useSaveCustomer } from "../hooks";
import type { Customer } from "../types";

const EMPTY = {
  customer_name: "",
  customer_direction: "",
  customer_category: "",
  customer_phone: "",
};

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}) {
  const [form, setForm] = useState(EMPTY);
  const save = useSaveCustomer();
  const { data: meta } = useMeta();
  const categories = (meta?.customer_categories ?? []).filter(
    (c) => c !== CUSTOMER_CATEGORY_MOSTRADOR
  );

  useEffect(() => {
    if (open) {
      setForm(
        customer
          ? {
              customer_name: customer.customer_name,
              customer_direction: customer.customer_direction ?? "",
              customer_category: customer.customer_category ?? "",
              customer_phone: customer.customer_phone ?? "",
            }
          : EMPTY
      );
    }
  }, [open, customer]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    save.mutate(
      { id: customer?.id, data: form },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Nombre</Label>
            <Input
              id="customer_name"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_phone">Teléfono</Label>
            <Input
              id="customer_phone"
              value={form.customer_phone}
              onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_direction">Dirección</Label>
            <Input
              id="customer_direction"
              value={form.customer_direction}
              onChange={(e) => setForm({ ...form, customer_direction: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={form.customer_category}
              onValueChange={(v) => setForm({ ...form, customer_category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
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

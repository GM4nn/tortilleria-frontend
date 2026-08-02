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
import { useMeta } from "@/features/meta/hooks";
import { useSaveSupplier } from "../hooks";
import type { Supplier } from "../types";

const EMPTY = {
  supplier_name: "",
  contact_name: "",
  phone: "",
  product_type: "",
  city: "",
};

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}) {
  const [form, setForm] = useState(EMPTY);
  const save = useSaveSupplier();
  const { data: meta } = useMeta();

  useEffect(() => {
    if (open) {
      setForm(
        supplier
          ? {
              supplier_name: supplier.supplier_name,
              contact_name: supplier.contact_name ?? "",
              phone: supplier.phone ?? "",
              product_type: supplier.product_type ?? "",
              city: supplier.city ?? "",
            }
          : EMPTY
      );
    }
  }, [open, supplier]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    save.mutate(
      { id: supplier?.id, data: form },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplier ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier_name">Empresa</Label>
            <Input
              id="supplier_name"
              value={form.supplier_name}
              onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_name">Contacto</Label>
            <Input
              id="contact_name"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de producto</Label>
            <Select
              value={form.product_type}
              onValueChange={(v) => setForm({ ...form, product_type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                {(meta?.supplier_product_types ?? []).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
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

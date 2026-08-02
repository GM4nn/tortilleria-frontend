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
import { useSuppliers } from "@/features/suppliers/hooks";
import { useDeleteSupply, useSaveSupply } from "../hooks";
import type { Supply } from "../types";

export function SupplyFormDialog({
  open,
  onOpenChange,
  supply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supply?: Supply | null;
}) {
  const { data: suppliers } = useSuppliers();
  const { data: meta } = useMeta();
  const save = useSaveSupply();
  const remove = useDeleteSupply();

  const handleDelete = () => {
    if (!supply) return;
    if (confirm(`¿Eliminar el insumo "${supply.supply_name}"?`)) {
      remove.mutate(supply.id, { onSuccess: () => onOpenChange(false) });
    }
  };

  const [name, setName] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [unit, setUnit] = useState<string>("kilos");

  useEffect(() => {
    if (open) {
      setName(supply?.supply_name ?? "");
      setSupplierId(supply?.supplier_id ? String(supply.supplier_id) : "");
      setUnit(supply?.unit ?? "kilos");
    }
  }, [open, supply]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    save.mutate(
      {
        id: supply?.id,
        data: {
          supply_name: name,
          supplier_id: supplierId ? Number(supplierId) : null,
          unit,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supply ? "Editar insumo" : "Nuevo insumo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supply_name">Nombre</Label>
            <Input
              id="supply_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Proveedor (opcional)</Label>
            <Select
              value={supplierId || "none"}
              onValueChange={(v) => setSupplierId(v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin proveedor</SelectItem>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>
                    {supplier.supplier_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Unidad</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(meta?.supply_units ?? []).map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            {supply && !supply.is_default ? (
              <Button
                type="button"
                variant="destructive"
                className="sm:mr-auto"
                onClick={handleDelete}
                disabled={remove.isPending}
              >
                Eliminar
              </Button>
            ) : null}
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

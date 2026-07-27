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
import { useSuppliers } from "@/features/suppliers/hooks";
import { useSaveSupply } from "../hooks";
import { SUPPLY_UNITS, type Supply } from "../types";

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
  const save = useSaveSupply();

  const [name, setName] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [unit, setUnit] = useState<string>("kilos");

  useEffect(() => {
    if (open) {
      setName(supply?.supply_name ?? "");
      setSupplierId(supply ? String(supply.supplier_id) : "");
      setUnit(supply?.unit ?? "kilos");
    }
  }, [open, supply]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!supplierId) return;
    save.mutate(
      { id: supply?.id, data: { supply_name: name, supplier_id: Number(supplierId), unit } },
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
            <Label>Proveedor</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proveedor" />
              </SelectTrigger>
              <SelectContent>
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
                {SUPPLY_UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending || !supplierId}>
              {save.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

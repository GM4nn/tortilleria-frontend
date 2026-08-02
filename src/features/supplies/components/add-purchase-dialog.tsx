"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { formatCurrency } from "@/lib/utils";
import { useSuppliers } from "@/features/suppliers/hooks";
import { useAddPurchase } from "../hooks";
import type { Supply } from "../types";

export function AddPurchaseDialog({
  supply,
  open,
  onOpenChange,
}: {
  supply: Supply | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: suppliers } = useSuppliers();
  const add = useAddPurchase(supply?.id ?? 0);

  const [supplierId, setSupplierId] = useState("");
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [remaining, setRemaining] = useState("0");
  const [notes, setNotes] = useState("");

  const total = (Number(quantity) || 0) * (Number(unitPrice) || 0);

  useEffect(() => {
    if (open && supply) {
      setSupplierId(String(supply.supplier_id));
      setDate("");
      setQuantity("");
      setUnitPrice("");
      setRemaining("0");
      setNotes("");
    }
  }, [open, supply]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!supply) return;
    add.mutate(
      {
        supplier_id: Number(supplierId) || supply.supplier_id,
        quantity: Number(quantity) || 0,
        unit: supply.unit,
        unit_price: Number(unitPrice) || 0,
        total_price: total,
        remaining: Number(remaining) || 0,
        purchase_date: date || null,
        notes: notes || null,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar compra — {supply?.supply_name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Proveedor</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.supplier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Fecha de compra</Label>
              <DatePicker value={date} onChange={(v) => setDate(v ?? "")} placeholder="Hoy" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="quantity">Cantidad ({supply?.unit})</Label>
              <Input id="quantity" type="number" step="0.01" value={quantity}
                onChange={(e) => setQuantity(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="unit_price">Precio unit.</Label>
              <Input id="unit_price" type="number" step="0.01" value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Total</Label>
              <Input value={formatCurrency(total)} readOnly disabled />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="remaining">Sobrante del periodo anterior</Label>
              <Input id="remaining" type="number" step="0.01" value={remaining}
                onChange={(e) => setRemaining(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notas</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={add.isPending}>
              {add.isPending ? "Guardando..." : "Registrar compra"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

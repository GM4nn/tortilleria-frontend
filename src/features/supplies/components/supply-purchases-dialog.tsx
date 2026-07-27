"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAddPurchase, usePurchases } from "../hooks";
import type { Supply } from "../types";

export function SupplyPurchasesDialog({
  supply,
  open,
  onOpenChange,
}: {
  supply: Supply | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: purchases } = usePurchases(open && supply ? supply.id : null);
  const addPurchase = useAddPurchase(supply?.id ?? 0);

  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [remaining, setRemaining] = useState("0");

  const total = (Number(quantity) || 0) * (Number(unitPrice) || 0);

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!supply) return;
    addPurchase.mutate(
      {
        supplier_id: supply.supplier_id,
        quantity: Number(quantity) || 0,
        unit: supply.unit,
        unit_price: Number(unitPrice) || 0,
        total_price: total,
        remaining: Number(remaining) || 0,
      },
      {
        onSuccess: () => {
          setQuantity("");
          setUnitPrice("");
          setRemaining("0");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compras — {supply?.supply_name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input id="quantity" type="number" step="0.01" value={quantity}
              onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="unit_price">Precio unit.</Label>
            <Input id="unit_price" type="number" step="0.01" value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="remaining">Sobrante</Label>
            <Input id="remaining" type="number" step="0.01" value={remaining}
              onChange={(e) => setRemaining(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={addPurchase.isPending}>
              + {formatCurrency(total)}
            </Button>
          </div>
        </form>

        <div className="max-h-72 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!purchases?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Sin compras
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{formatDate(purchase.created_at)}</TableCell>
                    <TableCell className="text-right">
                      {purchase.quantity} {purchase.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(purchase.unit_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(purchase.total_price)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

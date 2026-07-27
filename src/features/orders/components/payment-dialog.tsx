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
import { formatCurrency } from "@/lib/utils";
import { usePayOrder } from "../hooks";
import type { Order } from "../types";

export function PaymentDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pay = usePayOrder();
  const remaining = order ? order.total - order.amount_paid : 0;
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (open) setAmount(remaining > 0 ? remaining.toFixed(2) : "");
  }, [open, remaining]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!order) return;
    pay.mutate(
      { id: order.id, amount: Number(amount) },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pago — Pedido #{order?.id}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="flex justify-between">
              <span>Total</span>
              <span>{formatCurrency(order?.total ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pagado</span>
              <span>{formatCurrency(order?.amount_paid ?? 0)}</span>
            </div>
            <div className="flex justify-between font-semibold text-destructive">
              <span>Restante</span>
              <span>{formatCurrency(remaining)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto a abonar</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pay.isPending}>
              {pay.isPending ? "Registrando..." : "Registrar abono"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

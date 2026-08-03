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
import { CheckCircle2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
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
  const total = order?.total ?? 0;
  const paid = order?.amount_paid ?? 0;
  const remaining = order ? order.total - order.amount_paid : 0;
  const paidPct = total > 0 ? Math.min(100, Math.max(0, (paid / total) * 100)) : 0;
  const fullyPaid = remaining <= 0.009;
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar pago — Pedido #{order?.id}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* IZQUIERDA: resumen con número hero + medidor de pago */}
            <div className="flex flex-col justify-center rounded-xl border bg-gradient-to-br from-muted/60 to-muted/20 p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {fullyPaid ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : null}
                {fullyPaid ? "Pedido pagado" : "Restante por pagar"}
              </div>
              <p
                className={cn(
                  "mt-1 text-3xl font-bold tabular-nums",
                  fullyPaid ? "text-emerald-600" : "text-destructive"
                )}
              >
                {formatCurrency(remaining)}
              </p>

              {/* Medidor: cuánto se ha pagado del total */}
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                <span>
                  Pagado <span className="font-medium text-foreground">{formatCurrency(paid)}</span>
                </span>
                <span>
                  Total <span className="font-medium text-foreground">{formatCurrency(total)}</span>
                </span>
              </div>
            </div>

            {/* DERECHA: monto y botones */}
            <div className="flex flex-col gap-3">
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

              <div className="mt-auto flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={pay.isPending}>
                  {pay.isPending ? "Registrando..." : "Registrar abono"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { useCompleteOrder } from "../hooks";
import type { Order } from "../types";

export function CompleteDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const complete = useCompleteOrder();
  const remaining = order ? order.total - order.amount_paid : 0;
  const fullyPaid = remaining <= 0.009;

  const [finalPayment, setFinalPayment] = useState("");

  useEffect(() => {
    if (open) setFinalPayment(remaining > 0 ? remaining.toFixed(2) : "0");
  }, [open, remaining]);

  const submit = (payment: number) => {
    if (!order) return;
    complete.mutate(
      { id: order.id, data: { refund_items: [], final_payment: payment } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Completar pedido #{order?.id}</DialogTitle>
        </DialogHeader>

        {fullyPaid ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Seguro que quieres completar el pedido? Ya está totalmente pagado.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                No
              </Button>
              <Button onClick={() => submit(0)} disabled={complete.isPending}>
                {complete.isPending ? "Completando..." : "Sí, completar"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit(Number(finalPayment) || 0);
            }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Para completar, el pedido debe quedar totalmente pagado. Restante:{" "}
              <strong>{formatCurrency(remaining)}</strong>.
            </p>

            <div className="space-y-2">
              <Label htmlFor="final_payment">Pago final</Label>
              <Input
                id="final_payment"
                type="number"
                min="0"
                step="0.01"
                value={finalPayment}
                onChange={(e) => setFinalPayment(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={complete.isPending}>
                {complete.isPending ? "Completando..." : "Completar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

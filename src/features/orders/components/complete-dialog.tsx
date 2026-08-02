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

type RefundState = Record<number, { qty: string; note: string }>;

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
  const [refunds, setRefunds] = useState<RefundState>({});

  useEffect(() => {
    if (open) {
      setFinalPayment(remaining > 0 ? remaining.toFixed(2) : "0");
      setRefunds({});
    }
  }, [open, remaining]);

  const setRefund = (productId: number, field: "qty" | "note", value: string) => {
    setRefunds((prev) => ({
      ...prev,
      [productId]: {
        qty: prev[productId]?.qty ?? "0",
        note: prev[productId]?.note ?? "",
        [field]: value,
      },
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!order) return;

    const refund_items = order.details
      .map((d) => ({
        product_id: d.product_id,
        quantity: Number(refunds[d.product_id]?.qty) || 0,
        comments: refunds[d.product_id]?.note?.trim() || null,
      }))
      .filter((item) => item.quantity > 0);

    complete.mutate(
      {
        id: order.id,
        data: { refund_items, final_payment: fullyPaid ? 0 : Number(finalPayment) || 0 },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Completar pedido #{order?.id}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Devoluciones (pérdidas) */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ingresa la cantidad devuelta de cada producto (0 si no hubo devolución).
            </p>
            <div className="max-h-72 space-y-2 overflow-auto">
              {order?.details.map((d) => (
                <div key={d.product_id} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-medium">{d.product_name}</span>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      Pedido: {d.quantity}
                    </span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] gap-3">
                    <div className="space-y-1">
                      <Label>Cant. devuelta</Label>
                      <Input
                        type="number"
                        min="0"
                        max={d.quantity}
                        step="0.01"
                        value={refunds[d.product_id]?.qty ?? "0"}
                        onChange={(e) => setRefund(d.product_id, "qty", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Nota</Label>
                      <Input
                        value={refunds[d.product_id]?.note ?? ""}
                        onChange={(e) => setRefund(d.product_id, "note", e.target.value)}
                        placeholder="Motivo de la devolución (opcional)"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pago */}
          {fullyPaid ? (
            <p className="text-sm text-muted-foreground">
              ¿Seguro que quieres completar el pedido? Ya está totalmente pagado.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Para completar, el pedido debe quedar totalmente pagado. Restante:{" "}
                <strong>{formatCurrency(remaining)}</strong>.
              </p>
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
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={complete.isPending}>
              {complete.isPending ? "Completando..." : "Completar pedido"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

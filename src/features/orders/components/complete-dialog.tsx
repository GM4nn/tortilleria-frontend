"use client";

import { useEffect, useMemo, useState } from "react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import { useCompleteOrder } from "../hooks";
import type { Order } from "../types";

const NONE = "ninguno";

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
  const [refundProductId, setRefundProductId] = useState(NONE);
  const [refundQty, setRefundQty] = useState("");
  const [refundNote, setRefundNote] = useState("");

  useEffect(() => {
    if (open) {
      setFinalPayment(remaining > 0 ? remaining.toFixed(2) : "0");
      setRefundProductId(NONE);
      setRefundQty("");
      setRefundNote("");
    }
  }, [open, remaining]);

  const refundDetail = useMemo(
    () => order?.details.find((d) => String(d.product_id) === refundProductId) ?? null,
    [order, refundProductId]
  );

  // Ancho y columnas según cuántos campos se muestran
  const fieldCount = 1 + (refundDetail ? 2 : 0) + (fullyPaid ? 0 : 1);
  const widthClass =
    fieldCount >= 4
      ? "sm:max-w-5xl"
      : fieldCount === 3
      ? "sm:max-w-4xl"
      : fieldCount === 2
      ? "sm:max-w-2xl"
      : "sm:max-w-md";
  const gridColsClass =
    fieldCount >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : fieldCount === 3
      ? "sm:grid-cols-3"
      : fieldCount === 2
      ? "sm:grid-cols-2"
      : "grid-cols-1";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!order) return;

    const qty = Number(refundQty) || 0;
    const refund_items =
      refundDetail && qty > 0
        ? [
            {
              product_id: refundDetail.product_id,
              quantity: qty,
              comments: refundNote.trim() || null,
            },
          ]
        : [];

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
      <DialogContent className={cn("transition-[max-width]", widthClass)}>
        <DialogHeader>
          <DialogTitle>Completar pedido #{order?.id}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fila única de campos */}
          <div className={cn("grid items-start gap-3", gridColsClass)}>
            <div className="space-y-2">
              <Label>Producto devuelto</Label>
              <Select value={refundProductId} onValueChange={setRefundProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Ninguno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Ninguno</SelectItem>
                  {order?.details.map((d) => (
                    <SelectItem key={d.product_id} value={String(d.product_id)}>
                      {d.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {refundDetail ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="refund_qty">
                    Cant. devuelta{" "}
                    <span className="text-muted-foreground">(de {refundDetail.quantity})</span>
                  </Label>
                  <Input
                    id="refund_qty"
                    type="number"
                    min="0"
                    max={refundDetail.quantity}
                    step="0.01"
                    value={refundQty}
                    onChange={(e) => setRefundQty(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refund_note">Nota</Label>
                  <Input
                    id="refund_note"
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                    placeholder="Motivo (opcional)"
                  />
                </div>
              </>
            ) : null}

            {!fullyPaid ? (
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
            ) : null}
          </div>

          {/* Fila inferior: confirmación + botones */}
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {fullyPaid
                ? "¿Seguro que quieres completar el pedido? Ya está totalmente pagado."
                : `Debe quedar totalmente pagado. Restante: ${formatCurrency(remaining)}.`}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={complete.isPending}>
                {complete.isPending ? "Completando..." : "Completar pedido"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

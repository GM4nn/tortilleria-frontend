"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "../types";

function statusBadge(status: string) {
  if (status === "completado") return <Badge variant="success">Completado</Badge>;
  if (status === "cancelado") return <Badge variant="secondary">Cancelado</Badge>;
  return <Badge variant="warning">Pendiente</Badge>;
}

function paymentBadge(paymentStatus: string) {
  if (paymentStatus === "Pagado") return <Badge variant="success">Pagado</Badge>;
  if (paymentStatus === "Parcialmente Pagado")
    return <Badge variant="warning">Parcial</Badge>;
  return <Badge variant="destructive">Sin pagar</Badge>;
}

export function OrderDetailDialog({
  order,
  customerName,
  open,
  onOpenChange,
}: {
  order: Order | null;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fullyPaid = order?.payment_status === "Pagado";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pedido #{order?.id}</DialogTitle>
        </DialogHeader>

        {order ? (
          <div className="space-y-3">
            {/* Fechas */}
            <div>
              <p className="text-xs text-muted-foreground">
                Fecha de pedido: {formatDate(order.date)}
              </p>
              {order.completed_at ? (
                <p className="text-xs text-green-600">
                  Fecha de completado: {formatDate(order.completed_at)}
                </p>
              ) : null}
            </div>

            <hr className="border-t" />

            {/* Datos */}
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-28 shrink-0 font-semibold">Cliente:</span>
                <span>{customerName || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-28 shrink-0 font-semibold">Repartidor:</span>
                <span>{order.default_dealer ?? "Sin asignar"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-28 shrink-0 font-semibold">Entrega:</span>
                {statusBadge(order.status)}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-28 shrink-0 font-semibold">Pago:</span>
                {paymentBadge(order.payment_status)}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-28 shrink-0 font-semibold">Pagado:</span>
                <span className={fullyPaid ? "text-green-600" : "text-destructive"}>
                  {formatCurrency(order.amount_paid)} / {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            <hr className="border-t" />

            {/* Productos */}
            <div>
              <p className="mb-2 font-semibold">Productos:</p>
              <div className="space-y-2">
                {order.details.map((detail) => (
                  <div
                    key={detail.product_id}
                    className="flex items-center justify-between gap-2 rounded-md border p-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">
                        {detail.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        x{detail.quantity} @ {formatCurrency(detail.unit_price)}
                      </p>
                    </div>
                    <span className="font-medium text-green-600">
                      {formatCurrency(detail.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between rounded-md bg-slate-800 px-4 py-3 text-white">
              <span className="font-semibold">TOTAL:</span>
              <span className="text-xl font-bold">{formatCurrency(order.total)}</span>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

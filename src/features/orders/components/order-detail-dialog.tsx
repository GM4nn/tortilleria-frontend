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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pedido #{order?.id}</DialogTitle>
        </DialogHeader>

        {order ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* IZQUIERDA: fechas + datos */}
              <div className="space-y-1.5 text-sm">
                {/* Fechas */}
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground">
                    Fecha de pedido: {formatDate(order.date)}
                  </p>
                  {order.completed_at ? (
                    <p className="text-xs text-green-600">
                      Fecha de completado: {formatDate(order.completed_at)}
                    </p>
                  ) : null}
                </div>

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

              {/* DERECHA: productos y devoluciones */}
              <div className="space-y-3">
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

                {/* Devoluciones (pérdidas) */}
                {(order.refunds?.length ?? 0) > 0 ? (
                  <div>
                    <p className="mb-2 font-semibold text-amber-600">Devoluciones:</p>
                    <div className="space-y-2">
                      {order.refunds?.map((refund, index) => (
                        <div
                          key={`${refund.product_id}-${index}`}
                          className="flex items-start justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 p-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight">
                              {refund.product_name}
                            </p>
                            {refund.comments ? (
                              <p className="text-xs text-muted-foreground">{refund.comments}</p>
                            ) : null}
                          </div>
                          <span className="whitespace-nowrap font-medium text-amber-700">
                            -{refund.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
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

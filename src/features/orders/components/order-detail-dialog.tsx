"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useProducts } from "@/features/products/hooks";
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

  const { data: products } = useProducts();
  const iconById = new Map<number, string>();
  products?.forEach((p) => iconById.set(p.id, p.icon));

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
                {order.details.length === 1 ? (
                  /* Un solo producto: ícono + nombre a la izquierda, datos a la derecha */
                  <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                    <div className="flex w-28 shrink-0 flex-col items-center pt-2 text-center">
                      <span className="text-6xl">
                        {iconById.get(order.details[0].product_id) ?? "🛒"}
                      </span>
                      <p className="mt-3 w-full text-center font-semibold leading-tight">
                        {order.details[0].product_name}
                      </p>
                    </div>
                    <div className="w-40 shrink-0 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cantidad</span>
                        <span className="font-medium tabular-nums">
                          {order.details[0].quantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Precio</span>
                        <span className="font-medium tabular-nums">
                          {formatCurrency(order.details[0].unit_price)} c/u
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-lg font-bold tabular-nums text-green-600">
                          {formatCurrency(order.details[0].subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Cuadrícula grande: ícono enorme centrado por producto */
                  <div className="grid grid-cols-2 gap-3">
                    {order.details.map((detail) => (
                      <div
                        key={detail.product_id}
                        className="flex flex-col items-center rounded-lg border p-4 text-center"
                      >
                        <span className="text-6xl leading-none">
                          {iconById.get(detail.product_id) ?? "🛒"}
                        </span>
                        <p className="mt-2 font-semibold leading-tight">
                          {detail.product_name}
                        </p>
                        <p className="mt-1 text-sm tabular-nums">
                          <span className="font-medium">{detail.quantity}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            × {formatCurrency(detail.unit_price)}
                          </span>
                        </p>
                        <p className="mt-2 text-2xl font-bold tabular-nums text-green-600">
                          {formatCurrency(detail.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

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

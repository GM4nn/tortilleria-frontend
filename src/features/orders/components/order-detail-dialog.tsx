"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/features/orders/types";

function entregaLabel(status: string) {
  if (status === "completado") return "Entregado";
  if (status === "cancelado") return "Cancelado";
  return "Pendiente";
}
function pagoLabel(payment: string) {
  if (payment === "Pagado") return "Pagado";
  if (payment === "Parcialmente Pagado") return "Parcial";
  return "Sin pagar";
}

export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!order) return null;

  const remaining = order.total - order.amount_paid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pedido #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha</span>
            <span>{formatDate(order.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado entrega</span>
            <span className="font-medium">{entregaLabel(order.status)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado pago</span>
            <span className="font-medium">{pagoLabel(order.payment_status)}</span>
          </div>
          {order.default_dealer && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Repartidor</span>
              <span>{order.default_dealer}</span>
            </div>
          )}
          {order.notes && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notas</span>
              <span className="max-w-[60%] text-right">{order.notes}</span>
            </div>
          )}
        </div>

        <div className="mt-2">
          <p className="mb-2 text-sm font-semibold">Productos</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Kg</TableHead>
                <TableHead className="text-right">Precio/kg</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.details.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{d.product_name}</TableCell>
                  <TableCell className="text-right">{d.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(d.unit_price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(d.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Pagado</span>
            <span>{formatCurrency(order.amount_paid)}</span>
          </div>
          {remaining > 0.01 && (
            <div className="flex justify-between font-medium text-red-600">
              <span>Restante</span>
              <span>{formatCurrency(remaining)}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

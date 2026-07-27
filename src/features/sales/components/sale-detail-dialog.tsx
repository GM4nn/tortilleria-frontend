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
import type { Sale } from "../types";

export function SaleDetailDialog({
  sale,
  open,
  onOpenChange,
}: {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Venta #{sale?.id}</DialogTitle>
        </DialogHeader>

        {sale ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{formatDate(sale.date)}</p>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">P. Unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.details.map((detail) => (
                    <TableRow key={detail.product_id}>
                      <TableCell>{detail.product_name}</TableCell>
                      <TableCell className="text-right">{detail.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(detail.unit_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(detail.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between rounded-md bg-slate-800 px-4 py-3 text-white">
              <span className="font-semibold">TOTAL:</span>
              <span className="text-xl font-bold">{formatCurrency(sale.total)}</span>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

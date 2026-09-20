"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { CenteredSpinner } from "@/components/ui/spinner";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { useCustomers } from "@/features/customers/hooks";
import { useDealers } from "@/features/dealers/hooks";
import { useOrders } from "@/features/orders/hooks";
import type { Order, OrderFilters } from "@/features/orders/types";
import { OrderDetailDialog } from "./order-detail-dialog";

const PAGE_SIZE = 15;

function pagoClass(payment: string) {
  if (payment === "Pagado") return "bg-emerald-100 text-emerald-700";
  if (payment === "Parcialmente Pagado") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}
function pagoLabel(payment: string) {
  if (payment === "Pagado") return "Pagado";
  if (payment === "Parcialmente Pagado") return "Parcial";
  return "Sin pagar";
}
function entregaClass(status: string) {
  if (status === "completado") return "bg-emerald-100 text-emerald-700";
  if (status === "cancelado") return "bg-muted text-muted-foreground";
  return "bg-amber-100 text-amber-700";
}
function entregaLabel(status: string) {
  if (status === "completado") return "Entregado";
  if (status === "cancelado") return "Cancelado";
  return "Pendiente";
}

export function OrdersHistoryView() {
  const { data: customers } = useCustomers();
  const { data: dealers } = useDealers();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [dealer, setDealer] = useState("all");
  const [customerId, setCustomerId] = useState("all");
  const [page, setPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const filters: OrderFilters = useMemo(
    () => ({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: status === "all" ? undefined : status,
      paymentStatus: payment === "all" ? undefined : payment,
      dealer: dealer === "all" ? undefined : dealer,
      customerId: customerId === "all" ? undefined : Number(customerId),
    }),
    [dateFrom, dateTo, status, payment, dealer, customerId]
  );

  const { data, isLoading } = useOrders(filters, page, PAGE_SIZE);
  const orders = data?.data;
  const totalOrders = data?.pagination.total_data ?? 0;
  const totalPages = data?.pagination.total_pages ?? 1;

  const dealerName = useMemo(() => {
    const map = new Map<string, string>();
    dealers?.forEach((d) => map.set(d.username, d.name));
    return map;
  }, [dealers]);

  const customerMap = useMemo(() => {
    const map = new Map<number, string>();
    customers?.forEach((c) => map.set(c.id, c.customer_name));
    return map;
  }, [customers]);

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setStatus("all");
    setPayment("all");
    setDealer("all");
    setCustomerId("all");
    setPage(1);
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Historial de pedidos"
        description="Consulta y filtra todos los pedidos"
        action={
          <Button asChild variant="outline">
            <Link href="/orders">
              <ArrowLeft /> Volver
            </Link>
          </Button>
        }
      />

      <Card className="mb-4 shrink-0 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40 space-y-1">
            <Label>Desde</Label>
            <DatePicker value={dateFrom} onChange={(v) => { setDateFrom(v ?? ""); setPage(1); }} placeholder="Desde" />
          </div>
          <div className="w-40 space-y-1">
            <Label>Hasta</Label>
            <DatePicker value={dateTo} onChange={(v) => { setDateTo(v ?? ""); setPage(1); }} placeholder="Hasta" />
          </div>
          <div className="w-44 space-y-1">
            <Label>Cliente</Label>
            <Select value={customerId} onValueChange={(v) => { setCustomerId(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(customers ?? []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.customer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40 space-y-1">
            <Label>Estado</Label>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-40 space-y-1">
            <Label>Pago</Label>
            <Select value={payment} onValueChange={(v) => { setPayment(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Sin Pagar">Sin pagar</SelectItem>
                <SelectItem value="Parcialmente Pagado">Parcial</SelectItem>
                <SelectItem value="Pagado">Pagado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-44 space-y-1">
            <Label>Repartidor</Label>
            <Select value={dealer} onValueChange={(v) => { setDealer(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(dealers ?? []).map((d) => (
                  <SelectItem key={d.username} value={d.username}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" onClick={clearFilters}>
            Limpiar
          </Button>
        </div>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Table containerClassName="h-full max-h-none">
          <TableHeader>
            <TableRow>
              <TableHead className="w-20"># Pedido</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Repartidor</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Pagado</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <CenteredSpinner />
                </TableCell>
              </TableRow>
            ) : !orders?.length ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No hay pedidos
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow
                  key={o.id}
                  className="cursor-pointer"
                  onClick={() => setDetailOrder(o)}
                >
                  <TableCell className="font-medium">#{o.id}</TableCell>
                  <TableCell>{formatDateShort(o.date)}</TableCell>
                  <TableCell>{customerMap.get(o.customer_id) ?? `#${o.customer_id}`}</TableCell>
                  <TableCell>{o.default_dealer ? (dealerName.get(o.default_dealer) ?? o.default_dealer) : "—"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(o.total)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(o.amount_paid)}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${entregaClass(o.status)}`}>
                      {entregaLabel(o.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${pagoClass(o.payment_status)}`}>
                      {pagoLabel(o.payment_status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-3 flex shrink-0 items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {totalOrders} pedido{totalOrders === 1 ? "" : "s"} · Página {page} de {totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft /> Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente <ChevronRight />
          </Button>
        </div>
      </div>

      <OrderDetailDialog
        order={detailOrder}
        open={detailOrder !== null}
        onOpenChange={(o) => !o && setDetailOrder(null)}
      />
    </div>
  );
}

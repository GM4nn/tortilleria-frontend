"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Wallet,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { formatCurrency } from "@/lib/utils";
import { useCustomers } from "@/features/customers/hooks";
import { useDealers } from "@/features/dealers/hooks";
import { useCancelOrder, useOrders } from "../hooks";
import type { Order, OrderFilters } from "../types";
import { CompleteDialog } from "./complete-dialog";
import { OrderDetailDialog } from "./order-detail-dialog";
import { OrderFiltersDialog } from "./order-filters-dialog";
import { PaymentDialog } from "./payment-dialog";

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Cancelado",
};

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

function formatDay(value?: string) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const PAGE_SIZE = 10;

export function OrdersView() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOrders(filters, page, PAGE_SIZE);
  const orders = data?.data;
  const total = data?.pagination.total_data ?? 0;
  const totalPages = data?.pagination.total_pages ?? 1;

  const { data: customers } = useCustomers();
  const { data: dealers } = useDealers();
  const cancelOrder = useCancelOrder();

  const [payTarget, setPayTarget] = useState<Order | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Order | null>(null);
  const [detailTarget, setDetailTarget] = useState<Order | null>(null);

  const customerName = useMemo(() => {
    const map = new Map<number, string>();
    customers?.forEach((c) => map.set(c.id, c.customer_name));
    return map;
  }, [customers]);

  const dealerName = useMemo(() => {
    const map = new Map<string, string>();
    dealers?.forEach((d) => map.set(d.username, d.name));
    return map;
  }, [dealers]);

  const handleCancel = (order: Order) => {
    if (confirm(`¿Cancelar el pedido #${order.id}?`)) {
      cancelOrder.mutate(order.id);
    }
  };

  const applyFilters = (next: OrderFilters) => {
    setFilters(next);
    setPage(1);
  };

  const removeKeys = (keys: (keyof OrderFilters)[]) => {
    setFilters((prev) => {
      const next = { ...prev };
      keys.forEach((key) => delete next[key]);
      return next;
    });
    setPage(1);
  };

  const badges: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.dateFrom || filters.dateTo) {
    const from = filters.dateFrom ? formatDay(filters.dateFrom) : null;
    const to = filters.dateTo ? formatDay(filters.dateTo) : null;
    const label =
      from && to ? `${from} – ${to}` : from ? `desde ${from}` : `hasta ${to}`;
    badges.push({
      key: "date",
      label: `Fecha: ${label}`,
      onRemove: () => removeKeys(["dateFrom", "dateTo"]),
    });
  }
  if (filters.status) {
    badges.push({
      key: "status",
      label: `Entrega: ${STATUS_LABEL[filters.status] ?? filters.status}`,
      onRemove: () => removeKeys(["status"]),
    });
  }
  if (filters.paymentStatus) {
    badges.push({
      key: "payment",
      label: `Pago: ${filters.paymentStatus}`,
      onRemove: () => removeKeys(["paymentStatus"]),
    });
  }
  if (filters.dealer) {
    badges.push({
      key: "dealer",
      label: `Repartidor: ${dealerName.get(filters.dealer) ?? filters.dealer}`,
      onRemove: () => removeKeys(["dealer"]),
    });
  }
  if (filters.customerId != null) {
    badges.push({
      key: "customer",
      label: `Cliente: ${customerName.get(filters.customerId) ?? filters.customerId}`,
      onRemove: () => removeKeys(["customerId"]),
    });
  }

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Historial de pedidos"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFiltersOpen(true)}>
              <Filter /> Filtros
            </Button>
            <Button asChild variant="outline">
              <Link href="/orders">
                <ArrowLeft /> Volver
              </Link>
            </Button>
          </div>
        }
      />

      {badges.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros:</span>
          {badges.map((badge) => (
            <Badge key={badge.key} variant="secondary" className="gap-1 pr-1">
              {badge.label}
              <button
                type="button"
                onClick={badge.onRemove}
                className="ml-1 rounded-full p-0.5 hover:bg-black/10"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={() => applyFilters({})}>
            Limpiar todo
          </Button>
        </div>
      ) : null}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pagado</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Repartidor</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
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
              orders.map((order) => {
                const pending = order.status === "pendiente";
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{customerName.get(order.customer_id) ?? "—"}</TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>{formatCurrency(order.amount_paid)}</TableCell>
                    <TableCell>{statusBadge(order.status)}</TableCell>
                    <TableCell>{paymentBadge(order.payment_status)}</TableCell>
                    <TableCell>{order.default_dealer ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver detalle"
                          onClick={() => setDetailTarget(order)}
                        >
                          <Eye />
                        </Button>
                        {pending ? (
                          <>
                            {order.payment_status !== "Pagado" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Cobrar"
                                onClick={() => setPayTarget(order)}
                              >
                                <Wallet />
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Completar"
                              className="text-green-600"
                              onClick={() => setCompleteTarget(order)}
                            >
                              <CheckCircle2 />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Cancelar"
                              className="text-destructive"
                              onClick={() => handleCancel(order)}
                            >
                              <Ban />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {total} pedido{total === 1 ? "" : "s"} · Página {page} de {totalPages}
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

      <OrderFiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApply={applyFilters}
      />
      <PaymentDialog
        order={payTarget}
        open={payTarget !== null}
        onOpenChange={(open) => !open && setPayTarget(null)}
      />
      <CompleteDialog
        order={completeTarget}
        open={completeTarget !== null}
        onOpenChange={(open) => !open && setCompleteTarget(null)}
      />
      <OrderDetailDialog
        order={detailTarget}
        customerName={detailTarget ? customerName.get(detailTarget.customer_id) ?? "" : ""}
        open={detailTarget !== null}
        onOpenChange={(open) => !open && setDetailTarget(null)}
      />
    </>
  );
}

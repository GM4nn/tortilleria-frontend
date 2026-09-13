"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPinOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { CenteredSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { orderByNearest } from "@/lib/route-order";
import { useCustomers } from "@/features/customers/hooks";
import { useMeta } from "@/features/meta/hooks";
import { useRoutes } from "@/features/routes/hooks";
import { useOrders } from "@/features/orders/hooks";
import type { Order } from "@/features/orders/types";
import { useSchedules } from "@/features/schedules/hooks";
import { ScheduleFormDialog } from "@/features/schedules/components/schedule-form-dialog";
import type { ScheduledOrder } from "@/features/schedules/types";
import { ZoneMap } from "./zone-map";

const WEEKDAYS_SHORT = ["L", "M", "M", "J", "V", "S", "D"];

function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function entregaLabel(status: string) {
  if (status === "completado") return "Entregado";
  if (status === "cancelado") return "Cancelado";
  return "Pendiente";
}
function entregaClass(status: string) {
  if (status === "completado") return "bg-emerald-100 text-emerald-700";
  if (status === "cancelado") return "bg-muted text-muted-foreground";
  return "bg-amber-100 text-amber-700";
}
function pagoLabel(payment: string) {
  if (payment === "Pagado") return "Pagado";
  if (payment === "Parcialmente Pagado") return "Parcial";
  return "Sin pagar";
}
function pagoClass(payment: string) {
  if (payment === "Pagado") return "bg-emerald-100 text-emerald-700";
  if (payment === "Parcialmente Pagado") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export function ZoneDetailView({ routeId }: { routeId: number | null }) {
  const { data: routes } = useRoutes();
  const { data: customers, isLoading } = useCustomers();
  const { data: schedules } = useSchedules();
  const { data: meta } = useMeta();
  const { data: ordersPage } = useOrders({ dateFrom: todayIso(), dateTo: todayIso() }, 1, 300);

  const [editCustomerId, setEditCustomerId] = useState<number | null>(null);

  const route = routeId != null ? routes?.find((r) => r.id === routeId) : null;
  const color = route?.color ?? "#8b8b9e";
  const title = route?.name ?? "Sin zona";

  const zoneCustomers = useMemo(() => {
    const inZone = (customers ?? []).filter((c) => (c.route_id ?? null) === routeId);
    // Ordena de más cercano a más lejano empezando desde la tortillería
    if (!meta) return inZone;
    return orderByNearest(inZone, meta.shop_lat, meta.shop_lng);
  }, [customers, routeId, meta]);

  const scheduleByCustomer = useMemo(() => {
    const map = new Map<number, ScheduledOrder>();
    schedules?.forEach((s) => map.set(s.customer_id, s));
    return map;
  }, [schedules]);

  const todayOrderByCustomer = useMemo(() => {
    const map = new Map<number, Order>();
    ordersPage?.data.forEach((o) => map.set(o.customer_id, o));
    return map;
  }, [ordersPage]);

  const editing = editCustomerId != null ? scheduleByCustomer.get(editCustomerId) ?? null : null;
  const editOrder = editCustomerId != null ? todayOrderByCustomer.get(editCustomerId) ?? null : null;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={title}
        description="Toca un cliente para definir sus días y kilos"
        action={
          <Button asChild variant="outline">
            <Link href="/orders">
              <ArrowLeft /> Volver
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <CenteredSpinner />
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_340px]">
          {/* Mapa (isolate: contiene el z-index alto de Leaflet para que no tape el modal) */}
          <Card className="isolate min-h-0 overflow-hidden p-0">
            <ZoneMap customers={zoneCustomers} color={color} />
          </Card>

          {/* Lista de clientes de la zona */}
          <Card className="flex min-h-0 flex-col overflow-hidden">
            <div className="border-b p-3 text-sm font-semibold">
              {zoneCustomers.length} cliente{zoneCustomers.length === 1 ? "" : "s"}
            </div>
            <div className="flex-1 space-y-1 overflow-auto p-2">
              {zoneCustomers.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No hay clientes en esta zona. Asígnalos desde el módulo de Clientes
                  (campo de zona y ubicación).
                </p>
              ) : (
                zoneCustomers.map((c, idx) => {
                  const sched = scheduleByCustomer.get(c.id);
                  const days = new Set(sched?.items.map((i) => i.weekday) ?? []);
                  const hasLoc = c.latitude != null && c.longitude != null;
                  const order = todayOrderByCustomer.get(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditCustomerId(c.id)}
                      className="flex w-full items-start gap-2 rounded-md p-2 text-left transition-colors hover:bg-accent"
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-black"
                        style={{ background: hasLoc ? color : "#8b8b9e" }}
                      >
                        {hasLoc ? idx + 1 : ""}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.customer_name}</p>
                        <div className="mt-1 flex gap-0.5">
                          {WEEKDAYS_SHORT.map((d, wd) => (
                            <span
                              key={wd}
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-medium",
                                days.has(wd)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground/40"
                              )}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                        {/* Estado del pedido de HOY */}
                        {order ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                                entregaClass(order.status)
                              )}
                            >
                              {entregaLabel(order.status)}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                                pagoClass(order.payment_status)
                              )}
                            >
                              {pagoLabel(order.payment_status)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      {!hasLoc ? (
                        <MapPinOff
                          className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                          aria-label="Sin ubicación"
                        />
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}

      <ScheduleFormDialog
        open={editCustomerId !== null}
        onOpenChange={(o) => !o && setEditCustomerId(null)}
        schedule={editing}
        presetCustomerId={editCustomerId}
        todayOrder={editOrder}
      />
    </div>
  );
}

"use client";

import { CalendarDays, ClipboardList, Coins, ShoppingCart } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { CenteredSpinner } from "@/components/ui/spinner";
import { cn, formatCurrency } from "@/lib/utils";
import { useLossesTotal, useMonthlyIncome, useOrdersBreakdown, useTodaySummary } from "../hooks";

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function CountBox({
  label,
  today,
  month,
  className,
}: {
  label: string;
  today: number;
  month: number;
  className?: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="mb-2 text-center text-sm font-medium">{label}</p>
      <div className="flex justify-around text-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Hoy</p>
          <p className={cn("text-3xl font-bold tabular-nums", className)}>{today}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Mes</p>
          <p className={cn("text-3xl font-bold tabular-nums", className)}>{month}</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardView() {
  const today = useTodaySummary();
  const monthly = useMonthlyIncome();
  const losses = useLossesTotal();
  const breakdown = useOrdersBreakdown();

  const status = breakdown.data?.by_status;
  const payment = breakdown.data?.by_payment;

  return (
    <>
      <PageHeader title="Reportes" description="Resumen del negocio" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ingresos de hoy"
          value={formatCurrency(today.data?.income_total ?? 0)}
          icon={Coins}
        />
        <StatCard
          title="Ventas de Mostrador de HOY"
          value={String(today.data?.sales_count ?? 0)}
          icon={ShoppingCart}
        />
        <StatCard
          title="Ingresos del mes"
          value={formatCurrency(monthly.data?.income_total ?? 0)}
          icon={CalendarDays}
        />
        <StatCard
          title="Pedidos del mes"
          value={String(monthly.data?.orders_count ?? 0)}
          icon={ClipboardList}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pérdidas</CardTitle>
          </CardHeader>
          <CardContent>
            {losses.isLoading ? (
              <CenteredSpinner />
            ) : (
              <div>
                {/* Producto */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-6xl">{losses.data?.icon ?? "🌮"}</span>
                  <div className="min-w-0">
                    <p className="truncate text-2xl font-bold">
                      {losses.data?.name ?? "Tortilla"}
                    </p>
                    <p className="text-base text-muted-foreground">kilos devueltos</p>
                  </div>
                </div>

                {/* Hoy / Mes muy grande, abajo */}
                <div className="mt-10 flex items-end justify-center gap-8">
                  <div className="text-center">
                    <p className="text-base uppercase tracking-wide text-muted-foreground">Hoy</p>
                    <p className="text-8xl font-bold leading-none tabular-nums text-rose-600">
                      {(losses.data?.today ?? 0).toLocaleString("es-MX")}
                    </p>
                  </div>
                  <span className="pb-4 text-7xl font-light text-rose-300">/</span>
                  <div className="text-center">
                    <p className="text-base uppercase tracking-wide text-muted-foreground">Mes</p>
                    <p className="text-8xl font-bold leading-none tabular-nums text-rose-600">
                      {(losses.data?.month ?? 0).toLocaleString("es-MX")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pedidos por estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdown.isLoading ? (
              <CenteredSpinner />
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <p className="w-16 shrink-0 text-sm font-semibold text-muted-foreground">
                    Entrega
                  </p>
                  <div className="grid flex-1 grid-cols-3 gap-2">
                    <CountBox
                      label="Pendiente"
                      today={status?.pendiente.today ?? 0}
                      month={status?.pendiente.month ?? 0}
                      className="text-amber-600"
                    />
                    <CountBox
                      label="Completado"
                      today={status?.completado.today ?? 0}
                      month={status?.completado.month ?? 0}
                      className="text-emerald-600"
                    />
                    <CountBox
                      label="Cancelado"
                      today={status?.cancelado.today ?? 0}
                      month={status?.cancelado.month ?? 0}
                      className="text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="w-16 shrink-0 text-sm font-semibold text-muted-foreground">
                    Pago
                  </p>
                  <div className="grid flex-1 grid-cols-3 gap-2">
                    <CountBox
                      label="Sin pagar"
                      today={payment?.unpaid.today ?? 0}
                      month={payment?.unpaid.month ?? 0}
                      className="text-destructive"
                    />
                    <CountBox
                      label="Parcial"
                      today={payment?.partial.today ?? 0}
                      month={payment?.partial.month ?? 0}
                      className="text-amber-600"
                    />
                    <CountBox
                      label="Pagado"
                      today={payment?.paid.today ?? 0}
                      month={payment?.paid.month ?? 0}
                      className="text-emerald-600"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

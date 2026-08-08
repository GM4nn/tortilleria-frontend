"use client";

import { ArrowUpCircle, PackageSearch, ShoppingBag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { CenteredSpinner } from "@/components/ui/spinner";
import { cn, formatCurrency } from "@/lib/utils";
import { useFinance } from "../hooks";
import type { FinanceReport } from "../types";

function formatDay(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysLabel(days: number) {
  if (days <= 0) return "hoy";
  if (days === 1) return "hace 1 día";
  return `hace ${days} días`;
}

// Semáforo de reinversión: cuántas veces recuperaste el costo de tu última compra
function reinvestStatus(income: number, expense: number) {
  const coverage = expense > 0 ? income / expense : income > 0 ? Infinity : 0;

  if (coverage >= 2) {
    return {
      dot: "bg-emerald-500",
      box: "border-emerald-300 bg-emerald-50 text-emerald-700",
      label: "Buen momento",
      message:
        "Ya ganaste más del doble de tu última compra de insumos. Puedes reinvertir o volver a surtir con tranquilidad.",
    };
  }
  if (coverage >= 1) {
    return {
      dot: "bg-amber-500",
      box: "border-amber-300 bg-amber-50 text-amber-700",
      label: "Con cuidado",
      message:
        "Ya recuperaste lo de tu última compra, pero con poco margen. Puedes reponer lo esencial, sin gastos grandes.",
    };
  }
  return {
    dot: "bg-destructive",
    box: "border-destructive/30 bg-destructive/10 text-destructive",
    label: "Aún no",
    message:
      "Todavía no recuperas lo que gastaste en insumos. Mejor vende un poco más antes de volver a comprar.",
  };
}

function Content({ data }: { data: FinanceReport }) {
  const s = reinvestStatus(data.income, data.total_expense);
  const netPositive = data.net >= 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      {/* Resumen: gasto vs ingresos desde la última compra */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Desde tu última compra</CardTitle>
            {data.income_since ? (
              <p className="text-sm text-muted-foreground">
                {formatDay(data.income_since)} · {daysLabel(data.days_since)}
              </p>
            ) : null}
          </div>
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
              s.box
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", s.dot)} />
            {s.label}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShoppingBag className="h-4 w-4 text-amber-600" /> Gastaste en insumos
              </p>
              <p className="text-2xl font-bold tabular-nums text-amber-600">
                {formatCurrency(data.total_expense)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {data.items.length} insumo{data.items.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowUpCircle className="h-4 w-4 text-emerald-600" /> Has ganado
              </p>
              <p className="text-2xl font-bold tabular-nums text-emerald-600">
                {formatCurrency(data.income)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mostrador {formatCurrency(data.sales_total)} · Pedidos{" "}
                {formatCurrency(data.orders_total)}
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Diferencia
            </p>
            <p
              className={cn(
                "text-4xl font-bold tabular-nums",
                netPositive ? "text-emerald-600" : "text-destructive"
              )}
            >
              {formatCurrency(data.net)}
            </p>
            <p className="text-xs text-muted-foreground">
              Ganado − gasto en insumos
            </p>
          </div>

          <div className={cn("rounded-lg border p-3 text-sm", s.box)}>{s.message}</div>
        </CardContent>
      </Card>

      {/* Desglose por insumo (última compra de cada uno) */}
      <Card>
        <CardHeader>
          <CardTitle>Tu última compra por insumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.items.map((item) => (
            <div
              key={item.supply_name}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.supply_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDay(item.last_purchase_date)} · {daysLabel(item.days_since)}
                  {" · "}
                  {item.quantity.toLocaleString("es-MX")} {item.unit}
                </p>
              </div>
              <p className="shrink-0 text-lg font-bold tabular-nums text-amber-600">
                {formatCurrency(item.expense)}
              </p>
            </div>
          ))}

          <div className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3">
            <p className="font-semibold">Total</p>
            <p className="text-lg font-bold tabular-nums">
              {formatCurrency(data.total_expense)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FinanceView() {
  const { data, isLoading } = useFinance();

  return (
    <>
      <PageHeader
        title="Finanzas"
        description="Lo que gastaste en tu última compra de insumos vs lo que has ganado desde entonces"
      />

      {isLoading || !data ? (
        <CenteredSpinner />
      ) : !data.items.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <PackageSearch className="h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium">No hay compras de insumos recientes</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Registra una compra de insumos (del último mes) para ver cuánto
              gastaste y si conviene volver a surtir.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Content data={data} />
      )}
    </>
  );
}

"use client";

import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { CenteredSpinner } from "@/components/ui/spinner";
import { cn, formatCurrency } from "@/lib/utils";
import { useFinance } from "../hooks";
import type { FinancePeriod } from "../types";

// Semáforo según el margen de ganancia
function status(period: FinancePeriod) {
  if (period.net <= 0 || period.margin < 10) {
    return {
      dot: "bg-destructive",
      box: "border-destructive/30 bg-destructive/10 text-destructive",
      label: "No gastar de más",
      message:
        "El margen está bajo (o en pérdida). No es momento de gastar de más; enfócate en vender y controlar insumos.",
    };
  }
  if (period.margin < 30) {
    return {
      dot: "bg-amber-500",
      box: "border-amber-300 bg-amber-50 text-amber-700",
      label: "Con cuidado",
      message:
        "Vas estable. Puedes reponer insumos, pero evita gastos grandes hasta mejorar el margen.",
    };
  }
  return {
    dot: "bg-emerald-500",
    box: "border-emerald-300 bg-emerald-50 text-emerald-700",
    label: "Buen momento",
    message: `Buen margen. Puedes reinvertir con tranquilidad hasta ~${formatCurrency(
      period.net * 0.3
    )} (30% de la ganancia).`,
  };
}

function PeriodCard({ title, period }: { title: string; period: FinancePeriod }) {
  const s = status(period);
  const netPositive = period.net >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
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
        {/* Ingresos vs gastos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowUpCircle className="h-4 w-4 text-emerald-600" /> Ingresos
            </p>
            <p className="text-2xl font-bold tabular-nums text-emerald-600">
              {formatCurrency(period.income)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Mostrador {formatCurrency(period.sales_total)} · Pedidos{" "}
              {formatCurrency(period.orders_total)}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowDownCircle className="h-4 w-4 text-amber-600" /> Gasto en insumos
            </p>
            <p className="text-2xl font-bold tabular-nums text-amber-600">
              {formatCurrency(period.expenses)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Compras de insumos</p>
          </div>
        </div>

        {/* Ganancia neta */}
        <div className="rounded-lg border p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Ganancia neta</p>
          <p
            className={cn(
              "text-4xl font-bold tabular-nums",
              netPositive ? "text-emerald-600" : "text-destructive"
            )}
          >
            {formatCurrency(period.net)}
          </p>
          <p className="text-xs text-muted-foreground">Margen {period.margin.toFixed(1)}%</p>
        </div>

        {/* Semáforo / recomendación */}
        <div className={cn("rounded-lg border p-3 text-sm", s.box)}>{s.message}</div>
      </CardContent>
    </Card>
  );
}

export function FinanceView() {
  const { data, isLoading } = useFinance();

  return (
    <>
      <PageHeader
        title="Finanzas"
        description="Cuánto vendiste vs cuánto gastaste en insumos, y cuándo conviene invertir"
      />

      {isLoading || !data ? (
        <CenteredSpinner />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <PeriodCard title="Esta semana" period={data.week} />
          <PeriodCard title="Este mes" period={data.month} />
        </div>
      )}
    </>
  );
}

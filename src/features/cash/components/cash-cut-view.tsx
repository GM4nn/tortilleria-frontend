"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/utils";
import { useCashSummary, useCreateCut, useTodayCut } from "../hooks";

function startOfTodayIso() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function StatCard({
  title,
  amount,
  subtitle,
  className,
}: {
  title: string;
  amount: number;
  subtitle: string;
  className: string;
}) {
  return (
    <div className={`rounded-lg p-4 text-white ${className}`}>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
      <p className="text-xs opacity-80">{subtitle}</p>
    </div>
  );
}

export function CashCutView() {
  const summary = useCashSummary();
  const todayCut = useTodayCut();
  const createCut = useCreateCut();

  const [cash, setCash] = useState("0");
  const [card, setCard] = useState("0");
  const [transfer, setTransfer] = useState("0");
  const [notes, setNotes] = useState("");

  const expected = summary.data?.expected_total ?? 0;
  const declaredTotal = (Number(cash) || 0) + (Number(card) || 0) + (Number(transfer) || 0);
  const difference = declaredTotal - expected;
  const alreadyClosed = Boolean(todayCut.data);

  const diffLabel =
    Math.abs(difference) < 0.009 ? "Exacto" : difference > 0 ? "Sobrante" : "Faltante";
  const diffColor =
    Math.abs(difference) < 0.009 ? "text-green-600" : "text-destructive";

  const handleClose = () => {
    if (!summary.data) return;
    createCut.mutate({
      opened_at: startOfTodayIso(),
      sales_count: summary.data.sales_count,
      orders_count: summary.data.orders_count,
      sales_total: summary.data.sales_total,
      orders_total: summary.data.orders_total,
      expected_total: expected,
      declared_cash: Number(cash) || 0,
      declared_card: Number(card) || 0,
      declared_transfer: Number(transfer) || 0,
      declared_total: declaredTotal,
      difference,
      notes: notes || null,
    });
  };

  return (
    <>
      <PageHeader
        title="Corte de caja"
        description="Resumen del día y arqueo"
        action={
          <Button asChild variant="outline">
            <Link href="/cash">
              <ArrowLeft /> Volver
            </Link>
          </Button>
        }
      />

      {/* Resumen del día */}
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Ventas directas"
          amount={summary.data?.sales_total ?? 0}
          subtitle={`${summary.data?.sales_count ?? 0} ventas`}
          className="bg-blue-500"
        />
        <StatCard
          title="Pedidos completados"
          amount={summary.data?.orders_total ?? 0}
          subtitle={`${summary.data?.orders_count ?? 0} pedidos`}
          className="bg-amber-500"
        />
        <StatCard
          title="Total esperado"
          amount={expected}
          subtitle="del día"
          className="bg-emerald-600"
        />
      </div>

      {/* Registrar corte */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar corte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alreadyClosed ? (
            <p className="text-sm text-muted-foreground">
              El corte de hoy ya fue cerrado (diferencia{" "}
              {formatCurrency(todayCut.data?.difference ?? 0)}).
            </p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="cash">Efectivo</Label>
                  <Input id="cash" type="number" step="0.01" value={cash}
                    onChange={(e) => setCash(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="card">Tarjeta</Label>
                  <Input id="card" type="number" step="0.01" value={card}
                    onChange={(e) => setCard(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="transfer">Transferencia</Label>
                  <Input id="transfer" type="number" step="0.01" value={transfer}
                    onChange={(e) => setTransfer(e.target.value)} />
                </div>
              </div>

              <div className="rounded-md bg-muted p-3 text-sm">
                <div className="flex justify-between">
                  <span>Total declarado</span>
                  <span className="font-medium">{formatCurrency(declaredTotal)}</span>
                </div>
                <div className={`flex justify-between font-semibold ${diffColor}`}>
                  <span>Diferencia</span>
                  <span>
                    {formatCurrency(difference)} · {diffLabel}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleClose}
                disabled={createCut.isPending}
              >
                {createCut.isPending ? "Registrando..." : "Registrar corte de caja"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

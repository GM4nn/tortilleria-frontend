"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn, formatCurrency, formatDateShort } from "@/lib/utils";
import { useSuppliers } from "@/features/suppliers/hooks";
import { usePurchases, useSupply } from "../hooks";
import type { SupplyPurchase } from "../types";
import { AddPurchaseDialog } from "./add-purchase-dialog";

interface Period {
  from: string | null;
  to: string | null;
  compra: number;
  sobrante: number;
  disponible: number;
  consumido: number;
  restante: number;
  pct: number;
}

function keyDate(p: SupplyPurchase): string {
  return p.purchase_date ?? p.created_at ?? "";
}

function computePeriods(purchases: SupplyPurchase[]): Period[] {
  const asc = [...purchases].sort((a, b) => keyDate(a).localeCompare(keyDate(b)));
  const rows: Period[] = [];
  for (let i = 0; i < asc.length - 1; i++) {
    const from = asc[i];
    const to = asc[i + 1];
    const compra = from.quantity;
    const sobrante = from.remaining;
    const disponible = sobrante + compra;
    const restante = to.remaining;
    const consumido = disponible - restante;
    rows.push({
      from: from.purchase_date,
      to: to.purchase_date,
      compra,
      sobrante,
      disponible,
      consumido,
      restante,
      pct: disponible > 0 ? (consumido / disponible) * 100 : 0,
    });
  }
  return rows.reverse();
}

export function SupplyDetailView({ supplyId }: { supplyId: number }) {
  const { data: supply } = useSupply(supplyId);
  const { data: purchases, isLoading } = usePurchases(supplyId);
  const { data: suppliers } = useSuppliers();

  const [tab, setTab] = useState<"historial" | "periodos">("historial");
  const [addOpen, setAddOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<SupplyPurchase | null>(null);

  const supplierName = useMemo(() => {
    const map = new Map<number, string>();
    suppliers?.forEach((s) => map.set(s.id, s.supplier_name));
    return map;
  }, [suppliers]);

  const periods = useMemo(() => computePeriods(purchases ?? []), [purchases]);
  const current = periods[0] ?? null;

  const lastPurchase = useMemo(() => {
    const asc = [...(purchases ?? [])].sort((a, b) => keyDate(a).localeCompare(keyDate(b)));
    return asc[asc.length - 1] ?? null;
  }, [purchases]);
  const inventory = lastPurchase ? lastPurchase.remaining + lastPurchase.quantity : 0;

  const unit = supply?.unit ?? "";

  return (
    <>
      <PageHeader
        title={supply?.supply_name ?? "Insumo"}
        description={
          supply
            ? `${supplierName.get(supply.supplier_id ?? -1) ?? "—"} · ${supply.unit}`
            : undefined
        }
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/supplies">
                <ArrowLeft /> Volver
              </Link>
            </Button>
            <Button
              onClick={() => {
                setEditingPurchase(null);
                setAddOpen(true);
              }}
            >
              <Plus /> Registrar compra
            </Button>
          </div>
        }
      />

      {/* Botones tipo pestaña */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={tab === "historial" ? "default" : "outline"}
          onClick={() => setTab("historial")}
        >
          Historial de compras
        </Button>
        <Button
          variant={tab === "periodos" ? "default" : "outline"}
          onClick={() => setTab("periodos")}
        >
          Períodos
        </Button>
      </div>

      {isLoading ? (
        <CenteredSpinner />
      ) : tab === "historial" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!purchases?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Sin compras
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDateShort(p.purchase_date)}</TableCell>
                    <TableCell>{supplierName.get(p.supplier_id) ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {p.quantity} {p.unit}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(p.unit_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(p.total_price)}</TableCell>
                    <TableCell className="text-muted-foreground">{p.notes ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Editar compra"
                        onClick={() => {
                          setEditingPurchase(p);
                          setAddOpen(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="space-y-4">
          {current ? (
            <Card className="border-primary/40">
              <CardContent className="p-4">
                <p className="mb-3 font-semibold text-primary">
                  Resumen del período actual · {formatDateShort(current.from)} →{" "}
                  {formatDateShort(current.to)}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Disponible en el periodo</p>
                    <p className="text-lg font-bold">
                      {current.disponible.toFixed(2)} {unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {current.compra} comprados + {current.sobrante.toFixed(2)} sobrantes
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Consumido</p>
                    <p className="text-lg font-bold text-destructive">
                      {current.consumido.toFixed(2)} {unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lo que se usó en el periodo
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Restante</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {current.restante.toFixed(2)} {unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lo que sobró al final
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">% Consumo</p>
                    <p className="text-lg font-bold">{current.pct.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">
                      Consumido ÷ disponible
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Inventario actual</p>
                    <p className="text-lg font-bold">
                      {inventory.toFixed(2)} {unit}
                    </p>
                    {lastPurchase ? (
                      <p className="text-xs text-muted-foreground">
                        {lastPurchase.quantity} {unit} de la compra de{" "}
                        {formatDateShort(lastPurchase.purchase_date)} + {lastPurchase.remaining}{" "}
                        restante
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-destructive"
                    style={{ width: `${Math.min(100, current.pct)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hasta</TableHead>
                  <TableHead className="text-right">Compra</TableHead>
                  <TableHead className="text-right">Sobras del periodo anterior</TableHead>
                  <TableHead className="text-right">Disponible</TableHead>
                  <TableHead className="text-right">Consumido</TableHead>
                  <TableHead className="text-right">Restante</TableHead>
                  <TableHead className="text-right">% Consumo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!periods.length ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Se necesitan al menos 2 compras para calcular períodos
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((p, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDateShort(p.from)}</TableCell>
                      <TableCell>{formatDateShort(p.to)}</TableCell>
                      <TableCell className="text-right">
                        {p.compra} {unit}
                      </TableCell>
                      <TableCell className="text-right">{p.sobrante.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{p.disponible.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{p.consumido.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{p.restante.toFixed(2)}</TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          p.pct >= 80 ? "text-destructive" : ""
                        )}
                      >
                        {p.pct.toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      <AddPurchaseDialog
        supply={supply ?? null}
        purchase={editingPurchase}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
    </>
  );
}

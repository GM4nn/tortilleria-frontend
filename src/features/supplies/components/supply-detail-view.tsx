"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CenteredSpinner } from "@/components/ui/spinner";
import { cn, formatCurrency, formatDateShort } from "@/lib/utils";
import { useSuppliers } from "@/features/suppliers/hooks";
import { useInfinitePeriods, usePurchases, useSupply } from "../hooks";

const PAGE_SIZE = 6;

export function SupplyDetailView({ supplyId }: { supplyId: number }) {
  const { data: supply } = useSupply(supplyId);
  const { data: suppliers } = useSuppliers();

  const [tab, setTab] = useState<"historial" | "periodos">("historial");
  const [page, setPage] = useState(1);

  const { data: purchasesData, isLoading } = usePurchases(supplyId, page, PAGE_SIZE);
  const {
    data: periodsPages,
    isLoading: periodsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfinitePeriods(supplyId, PAGE_SIZE);

  const purchases = purchasesData?.data ?? [];
  const totalPurchases = purchasesData?.pagination.total_data ?? 0;
  const totalPages = purchasesData?.pagination.total_pages ?? 1;
  const currentPage = Math.min(page, totalPages);

  const periods = periodsPages?.pages.flatMap((p) => p.data) ?? [];
  const current = periodsPages?.pages[0]?.current ?? null;
  const inventory = periodsPages?.pages[0]?.inventory ?? 0;

  // Carga más períodos al acercarse al borde derecho
  const onPeriodsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (
      el.scrollWidth - el.scrollLeft - el.clientWidth < 250 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  const supplierName = useMemo(() => {
    const map = new Map<number, string>();
    suppliers?.forEach((s) => map.set(s.id, s.supplier_name));
    return map;
  }, [suppliers]);

  const unit = supply?.unit ?? "";

  return (
    <>
      {/* Encabezado: nombre + tabs a su derecha; acciones al final */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {supply?.supply_name ?? "Insumo"}
            </h1>
            {supply ? (
              <p className="text-sm text-muted-foreground">
                {supplierName.get(supply.supplier_id ?? -1) ?? "—"} · {supply.unit}
              </p>
            ) : null}
          </div>

          {/* Control segmentado de pestañas, al lado del nombre */}
          <div className="inline-flex rounded-md border p-1">
            <button
              type="button"
              onClick={() => setTab("historial")}
              className={cn(
                "rounded px-4 py-2 text-sm font-medium transition-colors",
                tab === "historial"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Historial de compras
            </button>
            <button
              type="button"
              onClick={() => setTab("periodos")}
              className={cn(
                "rounded px-4 py-2 text-sm font-medium transition-colors",
                tab === "periodos"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Períodos
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/supplies">
              <ArrowLeft /> Volver
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/supplies/${supplyId}/compras/nueva`}>
              <Plus /> Registrar compra
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <CenteredSpinner />
      ) : tab === "historial" ? (
        !purchases.length ? (
          <Card>
            <p className="p-8 text-center text-sm text-muted-foreground">Sin compras</p>
          </Card>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {purchases.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">
                        {formatDateShort(p.purchase_date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {supplierName.get(p.supplier_id) ?? "Sin proveedor"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      title="Editar compra"
                      asChild
                    >
                      <Link href={`/supplies/${supplyId}/compras/${p.id}`}>
                        <Pencil />
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Cantidad</p>
                      <p className="font-medium">
                        {p.quantity} {p.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Precio unit.</p>
                      <p className="font-medium">{formatCurrency(p.unit_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-medium">{formatCurrency(p.total_price)}</p>
                    </div>
                  </div>

                  {/* Sobrante con micro descripción */}
                  <div className="mt-3 rounded-md bg-muted/50 p-2">
                    <p className="text-sm font-semibold text-amber-600">
                      Sobrante: {p.remaining} {p.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sobrante del consumo de la compra anterior
                    </p>
                  </div>

                  {p.notes ? (
                    <p className="mt-3 text-xs text-muted-foreground">{p.notes}</p>
                  ) : null}
                </Card>
              ))}
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {totalPurchases} compra{totalPurchases === 1 ? "" : "s"} · Página {currentPage} de{" "}
                {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft /> Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Siguiente <ChevronRight />
                </Button>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {current ? (
            <Card className="border-primary/40">
              <CardContent className="p-4">
                <p className="mb-3 font-semibold text-primary">
                  Resumen del período actual · {formatDateShort(current.from_date)} →{" "}
                  {formatDateShort(current.to_date)}
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
                    <p className="text-lg font-bold text-emerald-600">
                      {current.consumido.toFixed(2)} {unit}
                    </p>
                    <p className="text-xs text-muted-foreground">Lo que se usó en el periodo</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Restante</p>
                    <p className="text-lg font-bold text-blue-600">
                      {current.restante.toFixed(2)} {unit}
                    </p>
                    <p className="text-xs text-muted-foreground">Lo que sobró al final</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">% Consumo</p>
                    <p className="text-lg font-bold">{current.pct.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Consumido ÷ disponible</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Inventario actual</p>
                    <p className="text-lg font-bold">
                      {inventory.toFixed(2)} {unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Disponible tras la última compra
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(100, current.pct)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Divisor con título */}
          <div className="flex items-center gap-3 pt-1">
            <h2 className="text-sm font-semibold text-muted-foreground">Períodos</h2>
            <hr className="flex-1 border-t" />
          </div>

          {periodsLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 w-72 shrink-0 animate-pulse rounded-lg border bg-muted/40"
                />
              ))}
            </div>
          ) : !periods.length ? (
            <Card>
              <p className="p-8 text-center text-sm text-muted-foreground">
                Se necesitan al menos 2 compras para calcular períodos
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {/* Carrusel horizontal con scroll infinito */}
              <div className="flex gap-3 overflow-x-auto pb-2" onScroll={onPeriodsScroll}>
                {periods.map((p, index) => (
                  <Card key={index} className="w-72 shrink-0 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold leading-tight">
                        {formatDateShort(p.from_date)} → {formatDateShort(p.to_date)}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                          p.pct >= 80
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {p.pct.toFixed(0)}%
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Compra</p>
                        <p className="font-medium">
                          {p.compra} {unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sobras del periodo anterior</p>
                        <p className="font-medium">
                          {p.sobrante.toFixed(2)} {unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Disponible</p>
                        <p className="font-medium">
                          {p.disponible.toFixed(2)} {unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Consumido</p>
                        <p className="font-medium text-emerald-600">
                          {p.consumido.toFixed(2)} {unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Restante</p>
                        <p className="font-medium text-blue-600">
                          {p.restante.toFixed(2)} {unit}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${Math.min(100, p.pct)}%` }}
                      />
                    </div>
                  </Card>
                ))}

                {/* Skeletons mientras carga la siguiente página */}
                {isFetchingNextPage
                  ? [0, 1].map((i) => (
                      <div
                        key={`sk-${i}`}
                        className="h-48 w-72 shrink-0 animate-pulse rounded-lg border bg-muted/40"
                      />
                    ))
                  : null}
              </div>

              <p className="text-xs text-muted-foreground">
                {hasNextPage
                  ? "Desliza a la derecha para ver más períodos →"
                  : "No hay más períodos"}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

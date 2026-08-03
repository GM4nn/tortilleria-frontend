"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
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
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useCashHistory } from "../hooks";
import type { CashFilters } from "../types";

const PAGE_SIZE = 15;

export function CashHistoryView() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filters, setFilters] = useState<CashFilters>({});
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCashHistory(filters, page, PAGE_SIZE);
  const cuts = data?.data;
  const total = data?.pagination.total_data ?? 0;
  const totalPages = data?.pagination.total_pages ?? 1;

  const applyFilter = () => {
    setFilters({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
    setPage(1);
  };

  const clearFilter = () => {
    setDateFrom("");
    setDateTo("");
    setFilters({});
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Historial de cortes"
        description="Cortes de caja anteriores"
        action={
          <Button asChild variant="outline">
            <Link href="/cash">
              <ArrowLeft /> Volver
            </Link>
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40 space-y-1">
            <Label>Desde</Label>
            <DatePicker value={dateFrom} onChange={(v) => setDateFrom(v ?? "")} placeholder="Desde" />
          </div>
          <div className="w-40 space-y-1">
            <Label>Hasta</Label>
            <DatePicker value={dateTo} onChange={(v) => setDateTo(v ?? "")} placeholder="Hasta" />
          </div>
          <Button onClick={applyFilter}>Filtrar</Button>
          <Button variant="ghost" onClick={clearFilter}>
            Limpiar
          </Button>
        </div>
      </Card>

      <Card>
        <Table containerClassName="max-h-[calc(100vh-22rem)]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">#</TableHead>
              <TableHead>Fecha cierre</TableHead>
              <TableHead className="text-right">Ventas</TableHead>
              <TableHead className="text-right">Pedidos</TableHead>
              <TableHead className="text-right">Efectivo</TableHead>
              <TableHead className="text-right">Tarjeta</TableHead>
              <TableHead className="text-right">Transf.</TableHead>
              <TableHead className="text-right">Declarado</TableHead>
              <TableHead className="text-right">Esperado</TableHead>
              <TableHead className="text-right">Diferencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <CenteredSpinner />
                </TableCell>
              </TableRow>
            ) : !cuts?.length ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  Sin cortes
                </TableCell>
              </TableRow>
            ) : (
              cuts.map((cut) => (
                <TableRow key={cut.id}>
                  <TableCell className="font-medium">{cut.id}</TableCell>
                  <TableCell>{formatDate(cut.closed_at)}</TableCell>
                  <TableCell className="text-right">{cut.sales_count}</TableCell>
                  <TableCell className="text-right">{cut.orders_count}</TableCell>
                  <TableCell className="text-right">{formatCurrency(cut.declared_cash)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(cut.declared_card)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(cut.declared_transfer)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(cut.declared_total)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(cut.expected_total)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      cut.difference > 0.009
                        ? "text-emerald-600"
                        : cut.difference < -0.009
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatCurrency(cut.difference)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {total} corte{total === 1 ? "" : "s"} · Página {page} de {totalPages}
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
    </>
  );
}

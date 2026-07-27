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
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSales } from "../hooks";
import type { Sale, SaleFilters } from "../types";
import { SaleDetailDialog } from "./sale-detail-dialog";

const PAGE_SIZE = 15;

export function SalesHistoryView() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filters, setFilters] = useState<SaleFilters>({});
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Sale | null>(null);

  const { data, isLoading } = useSales(filters, page, PAGE_SIZE);
  const sales = data?.data;
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
        title="Ventas"
        description="Historial de ventas de mostrador"
        action={
          <Button asChild variant="outline">
            <Link href="/sales">
              <ArrowLeft /> Volver
            </Link>
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label>Desde</Label>
            <DatePicker value={dateFrom} onChange={(v) => setDateFrom(v ?? "")} placeholder="Desde" />
          </div>
          <div className="space-y-1">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24"># Venta</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <CenteredSpinner />
                </TableCell>
              </TableRow>
            ) : !sales?.length ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No hay ventas
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow
                  key={sale.id}
                  className="cursor-pointer"
                  onClick={() => setDetail(sale)}
                >
                  <TableCell className="font-medium">#{sale.id}</TableCell>
                  <TableCell>{formatDate(sale.date)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {total} venta{total === 1 ? "" : "s"} · Página {page} de {totalPages}
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

      <SaleDetailDialog
        sale={detail}
        open={detail !== null}
        onOpenChange={(open) => !open && setDetail(null)}
      />
    </>
  );
}

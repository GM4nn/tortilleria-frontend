"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomers } from "@/features/customers/hooks";
import { useDealers } from "@/features/dealers/hooks";
import type { OrderFilters } from "../types";

const ALL = "todos";

type FilterType =
  | "date"
  | "status"
  | "payment"
  | "dealer"
  | "customer"
  | "refunds";

const FILTER_TYPES: { value: FilterType; label: string }[] = [
  { value: "date", label: "Rango de fecha" },
  { value: "status", label: "Estado de entrega" },
  { value: "payment", label: "Estado de pago" },
  { value: "dealer", label: "Repartidor" },
  { value: "customer", label: "Cliente" },
  { value: "refunds", label: "¿Hubo devoluciones?" },
];

export function OrderFiltersDialog({
  open,
  onOpenChange,
  filters,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: OrderFilters;
  onApply: (filters: OrderFilters) => void;
}) {
  const { data: dealers } = useDealers();
  const { data: customers } = useCustomers();

  const [filterType, setFilterType] = useState<FilterType>("date");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState(ALL);
  const [payment, setPayment] = useState(ALL);
  const [dealer, setDealer] = useState(ALL);
  const [customer, setCustomer] = useState(ALL);
  const [refunds, setRefunds] = useState(ALL);

  useEffect(() => {
    if (open) {
      setDateFrom(filters.dateFrom ?? "");
      setDateTo(filters.dateTo ?? "");
      setStatus(filters.status ?? ALL);
      setPayment(filters.paymentStatus ?? ALL);
      setDealer(filters.dealer ?? ALL);
      setCustomer(filters.customerId != null ? String(filters.customerId) : ALL);
      setRefunds(filters.hasRefunds == null ? ALL : filters.hasRefunds ? "si" : "no");
    }
  }, [open, filters]);

  const apply = () => {
    onApply({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: status === ALL ? undefined : status,
      paymentStatus: payment === ALL ? undefined : payment,
      dealer: dealer === ALL ? undefined : dealer,
      customerId: customer === ALL ? undefined : Number(customer),
      hasRefunds: refunds === ALL ? undefined : refunds === "si",
    });
    onOpenChange(false);
  };

  const clear = () => {
    onApply({});
    onOpenChange(false);
  };

  // Un filtro está activo si tiene un valor distinto de "todos"
  // (la fecha se evalúa por si tiene desde/hasta)
  const activeMap: Record<FilterType, boolean> = {
    date: Boolean(dateFrom || dateTo),
    status: status !== ALL,
    payment: payment !== ALL,
    dealer: dealer !== ALL,
    customer: customer !== ALL,
    refunds: refunds !== ALL,
  };
  const activeCount = Object.values(activeMap).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Filtrar pedidos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selector del tipo de filtro */}
          <div className="space-y-2">
            <Label>
              Tipo de filtro
              {activeCount > 0 ? (
                <span className="ml-2 font-normal text-muted-foreground">
                  · {activeCount} activo{activeCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </Label>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center gap-2">
                      {type.label}
                      {activeMap[type.value] ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : null}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Control según el tipo seleccionado */}
          {filterType === "date" ? (
            <div className="space-y-2">
              <Label>Rango de fecha (creación)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0 space-y-1">
                  <span className="block text-xs text-muted-foreground">Desde</span>
                  <DatePicker value={dateFrom} onChange={(v) => setDateFrom(v ?? "")} />
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="block text-xs text-muted-foreground">Hasta</span>
                  <DatePicker value={dateTo} onChange={(v) => setDateTo(v ?? "")} />
                </div>
              </div>
            </div>
          ) : null}

          {filterType === "status" ? (
            <div className="space-y-2">
              <Label>Estado de entrega</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {filterType === "payment" ? (
            <div className="space-y-2">
              <Label>Estado de pago</Label>
              <Select value={payment} onValueChange={setPayment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  <SelectItem value="Sin Pagar">Sin Pagar</SelectItem>
                  <SelectItem value="Parcialmente Pagado">Parcialmente Pagado</SelectItem>
                  <SelectItem value="Pagado">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {filterType === "dealer" ? (
            <div className="space-y-2">
              <Label>Repartidor</Label>
              <Select value={dealer} onValueChange={setDealer}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {dealers?.map((d) => (
                    <SelectItem key={d.id} value={d.username}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {filterType === "customer" ? (
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {customers?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.customer_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {filterType === "refunds" ? (
            <div className="space-y-2">
              <Label>¿Hubo devoluciones?</Label>
              <Select value={refunds} onValueChange={setRefunds}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  <SelectItem value="si">Con devoluciones</SelectItem>
                  <SelectItem value="no">Sin devoluciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={clear}>
            Limpiar
          </Button>
          <Button onClick={apply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

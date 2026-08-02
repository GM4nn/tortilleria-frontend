"use client";

import { useEffect, useState } from "react";

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

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState(ALL);
  const [payment, setPayment] = useState(ALL);
  const [dealer, setDealer] = useState(ALL);
  const [customer, setCustomer] = useState(ALL);

  useEffect(() => {
    if (open) {
      setDateFrom(filters.dateFrom ?? "");
      setDateTo(filters.dateTo ?? "");
      setStatus(filters.status ?? ALL);
      setPayment(filters.paymentStatus ?? ALL);
      setDealer(filters.dealer ?? ALL);
      setCustomer(filters.customerId != null ? String(filters.customerId) : ALL);
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
    });
    onOpenChange(false);
  };

  const clear = () => {
    onApply({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Filtrar pedidos</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Rango de fecha (creación)</Label>
            <div className="flex items-center gap-2">
              <DatePicker
                value={dateFrom}
                onChange={(v) => setDateFrom(v ?? "")}
                placeholder="Desde"
              />
              <span className="text-sm text-muted-foreground">a</span>
              <DatePicker
                value={dateTo}
                onChange={(v) => setDateTo(v ?? "")}
                placeholder="Hasta"
              />
            </div>
          </div>

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

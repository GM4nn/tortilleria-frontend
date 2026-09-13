"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  useCustomers,
  useCustomerPrices,
  useSetCustomerPrice,
} from "@/features/customers/hooks";
import { useDealers } from "@/features/dealers/hooks";
import { useProducts } from "@/features/products/hooks";
import type { Order } from "@/features/orders/types";
import { useSaveSchedule } from "../hooks";
import type { ScheduledOrder } from "../types";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const NO_DEALER = "__none__";

type Grid = Record<string, string>; // `${productId}:${weekday}` -> cantidad

export function ScheduleFormDialog({
  open,
  onOpenChange,
  schedule,
  presetCustomerId,
  todayOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: ScheduledOrder | null;
  presetCustomerId?: number | null;
  todayOrder?: Order | null;
}) {
  const save = useSaveSchedule();
  const { data: customers } = useCustomers();
  const { data: dealers } = useDealers();
  const { data: allProducts } = useProducts();

  const products = useMemo(() => {
    const defaults = (allProducts ?? []).filter((p) => p.is_default);
    return defaults.length ? defaults : allProducts ?? [];
  }, [allProducts]);

  const [customerId, setCustomerId] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [dealer, setDealer] = useState("");
  const [grid, setGrid] = useState<Grid>({});
  const [prices, setPrices] = useState<Record<number, string>>({}); // productId -> precio

  const numericCustomerId = customerId ? Number(customerId) : null;
  const { data: customerPrices } = useCustomerPrices(numericCustomerId);
  const setCustomerPrice = useSetCustomerPrice(numericCustomerId ?? 0);

  // Carga el precio por cliente de cada producto (custom o precio base del producto)
  useEffect(() => {
    if (!open) return;
    const map: Record<number, string> = {};
    products.forEach((p) => {
      const cp = customerPrices?.find((x) => x.product_id === p.id);
      map[p.id] = cp ? String(cp.custom_price) : String(p.price);
    });
    setPrices(map);
  }, [open, customerId, customerPrices, products]);

  const savePrice = (productId: number, raw: string) => {
    const price = parseFloat(raw);
    if (!numericCustomerId || Number.isNaN(price) || price < 0) return;
    const current = customerPrices?.find((x) => x.product_id === productId)?.custom_price;
    if (current === price) return; // sin cambios
    setCustomerPrice.mutate({ productId, price });
  };

  useEffect(() => {
    if (!open) return;
    if (schedule) {
      setCustomerId(String(schedule.customer_id));
      setDeliveryTime(schedule.delivery_time ?? "");
      setDealer(schedule.default_dealer ?? "");
      const g: Grid = {};
      schedule.items.forEach((it) => {
        g[`${it.product_id}:${it.weekday}`] = String(it.quantity);
      });
      setGrid(g);
    } else {
      setCustomerId(presetCustomerId ? String(presetCustomerId) : "");
      setDeliveryTime("");
      setDealer("");
      setGrid({});
    }
  }, [open, schedule, presetCustomerId]);

  const setCell = (productId: number, weekday: number, value: string) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setGrid((g) => ({ ...g, [`${productId}:${weekday}`]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customerId) return;

    const items = products.flatMap((p) =>
      WEEKDAYS.map((_, wd) => {
        const raw = grid[`${p.id}:${wd}`];
        const qty = raw ? parseFloat(raw) : 0;
        return qty > 0 ? { weekday: wd, product_id: p.id, quantity: qty } : null;
      }).filter((x): x is { weekday: number; product_id: number; quantity: number } => x !== null)
    );

    save.mutate(
      {
        id: schedule?.id,
        data: {
          customer_id: Number(customerId),
          delivery_time: deliveryTime || null,
          default_dealer: dealer || null,
          active: schedule?.active ?? true,
          items,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {schedule ? "Editar pedido programado" : "Nuevo pedido programado"}
          </DialogTitle>
        </DialogHeader>

        {/* Estado del pedido de HOY (si ya se generó) */}
        {todayOrder ? (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 p-2 text-sm">
            <span className="font-medium">Pedido de hoy:</span>
            <span
              className={
                todayOrder.status === "completado"
                  ? "font-semibold text-emerald-600"
                  : todayOrder.status === "cancelado"
                  ? "text-muted-foreground"
                  : "font-semibold text-amber-600"
              }
            >
              {todayOrder.status === "completado"
                ? "Entregado"
                : todayOrder.status === "cancelado"
                ? "Cancelado"
                : "Pendiente"}
            </span>
            <span className="text-muted-foreground">·</span>
            <span
              className={
                todayOrder.payment_status === "Pagado"
                  ? "font-semibold text-emerald-600"
                  : todayOrder.payment_status === "Parcialmente Pagado"
                  ? "font-semibold text-amber-600"
                  : "font-semibold text-red-600"
              }
            >
              {formatCurrency(todayOrder.amount_paid)} / {formatCurrency(todayOrder.total)}
            </span>
            {/* Kilos entregados (y devueltos) reales, según el móvil */}
            {todayOrder.details.length > 0 ? (
              <div className="mt-1 w-full text-xs text-muted-foreground">
                {todayOrder.details.map((d) => {
                  const ret = (todayOrder.refunds ?? [])
                    .filter((r) => r.product_id === d.product_id)
                    .reduce((s, r) => s + r.quantity, 0);
                  return (
                    <span key={d.product_id} className="mr-3 whitespace-nowrap">
                      {d.product_name}:{" "}
                      <strong className="text-foreground">{d.quantity}</strong> kg
                      {ret > 0 ? (
                        <span className="text-amber-600"> (dev. {ret})</span>
                      ) : null}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mb-3 rounded-md border border-dashed p-2 text-xs text-muted-foreground">
            Aún no se ha generado el pedido de hoy para este cliente.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.customer_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_time">Hora de entrega</Label>
              <Input
                id="delivery_time"
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Repartidor (opcional)</Label>
              <Select
                value={dealer || NO_DEALER}
                onValueChange={(v) => setDealer(v === NO_DEALER ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="El de la ruta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DEALER}>El de la ruta</SelectItem>
                  {dealers?.map((d) => (
                    <SelectItem key={d.username} value={d.username}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grilla semanal: kilos por producto y día */}
          <div className="space-y-2">
            <Label>Kilos por día</Label>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left font-medium">Producto</th>
                    <th className="p-2 text-center font-medium">Precio $</th>
                    {WEEKDAYS.map((d) => (
                      <th key={d} className="p-2 text-center font-medium">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="whitespace-nowrap p-2 font-medium">
                        {p.icon} {p.name}
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-9 w-16 text-center font-semibold"
                          inputMode="decimal"
                          placeholder={String(p.price)}
                          value={prices[p.id] ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v !== "" && !/^\d*\.?\d*$/.test(v)) return;
                            setPrices((pr) => ({ ...pr, [p.id]: v }));
                          }}
                          onBlur={(e) => savePrice(p.id, e.target.value)}
                          disabled={!numericCustomerId}
                        />
                      </td>
                      {WEEKDAYS.map((_, wd) => (
                        <td key={wd} className="p-1">
                          <Input
                            className="h-9 w-14 text-center"
                            inputMode="decimal"
                            placeholder="0"
                            value={grid[`${p.id}:${wd}`] ?? ""}
                            onChange={(e) => setCell(p.id, wd, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Deja en blanco (o 0) los días sin entrega. El <strong>precio</strong> es el que
              se le cobra a este cliente por kilo (se guarda al salir del campo) y se usa al
              generar el pedido.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending || !customerId}>
              {save.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

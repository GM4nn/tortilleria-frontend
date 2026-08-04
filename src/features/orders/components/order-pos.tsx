"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Minus, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { cn, formatCurrency } from "@/lib/utils";
import {
  useCustomerPrices,
  useCustomers,
  useSetCustomerPrice,
} from "@/features/customers/hooks";
import { useDealers } from "@/features/dealers/hooks";
import { useProducts } from "@/features/products/hooks";
import { useCreateOrder } from "../hooks";

export function OrderPos() {
  const router = useRouter();
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  const { data: dealers } = useDealers();
  const createOrder = useCreateOrder();

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [dealer, setDealer] = useState("");
  const [advance, setAdvance] = useState("0");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [prices, setPrices] = useState<Record<number, string>>({}); // precios editados
  const [editingId, setEditingId] = useState<number | null>(null); // producto en edición de precio

  const { data: customerPrices } = useCustomerPrices(customerId);
  const setCustomerPrice = useSetCustomerPrice(customerId ?? 0);

  const priceMap = useMemo(() => {
    const map = new Map<number, number>();
    customerPrices?.forEach((p) => map.set(p.product_id, p.custom_price));
    return map;
  }, [customerPrices]);

  // Solo los productos del sistema (tortilla y totopos). Fallback: todos.
  const orderProducts = useMemo(() => {
    const all = products ?? [];
    const defaults = all.filter((p) => p.is_default);
    return defaults.length ? defaults : all;
  }, [products]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = customers ?? [];
    return term ? list.filter((c) => c.customer_name.toLowerCase().includes(term)) : list;
  }, [customers, search]);

  const selectedCustomer = customers?.find((c) => c.id === customerId) ?? null;

  // Al cambiar de cliente se reinician los precios editados (cada cliente tiene el suyo)
  useEffect(() => {
    setPrices({});
    setEditingId(null);
  }, [customerId]);

  const priceOf = (productId: number, base: number) =>
    prices[productId] !== undefined
      ? Number(prices[productId]) || 0
      : priceMap.get(productId) ?? base;

  const priceStr = (productId: number, base: number) =>
    prices[productId] ?? String(priceMap.get(productId) ?? base);

  const setQty = (productId: number, qty: number) =>
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });

  const commitPrice = (productId: number, base: number) => {
    if (customerId == null || prices[productId] === undefined) return;
    const value = Number(prices[productId]) || 0;
    const currentDefault = priceMap.get(productId) ?? base;
    if (value > 0 && value !== currentDefault) {
      setCustomerPrice.mutate({ productId, price: value });
    }
  };

  const cart = useMemo(
    () =>
      orderProducts
        .filter((p) => (quantities[p.id] ?? 0) > 0)
        .map((p) => ({
          product_id: p.id,
          quantity: quantities[p.id],
          unit_price: priceOf(p.id, p.price),
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderProducts, quantities, prices, priceMap]
  );

  const total = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const canSave = customerId !== null && cart.length > 0 && !createOrder.isPending;

  const handleSave = () => {
    if (customerId === null) return;
    createOrder.mutate(
      {
        customer_id: customerId,
        amount_paid: Number(advance) || 0,
        default_dealer: dealer || null,
        items: cart,
      },
      { onSuccess: () => router.push("/orders/historial") }
    );
  };

  return (
    <>
      <PageHeader
        title="Nuevo pedido"
        action={
          <Button variant="outline" onClick={() => router.push("/orders")}>
            <ArrowLeft /> Volver
          </Button>
        }
      />

      <div className="-mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Izquierda: productos + cliente */}
        <div className="min-w-0 space-y-4">
        {/* Productos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {orderProducts.map((product) => {
                const qty = quantities[product.id] ?? 0;
                const active = qty > 0;
                return (
                  <div
                    key={product.id}
                    className={cn(
                      "flex items-center gap-5 rounded-xl border p-4 transition-colors",
                      active && "border-green-500 bg-green-50"
                    )}
                  >
                    <span className="shrink-0 pr-2 text-6xl">{product.icon}</span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-lg font-semibold leading-tight">{product.name}</p>

                      {/* Precio: base si no hay cliente; editable (lápiz) si hay cliente */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Input
                            className="h-10 flex-1"
                            type="number"
                            min="0"
                            step="0.01"
                            value={priceStr(product.id, product.price)}
                            disabled={customerId === null || editingId !== product.id}
                            onChange={(e) =>
                              setPrices((prev) => ({ ...prev, [product.id]: e.target.value }))
                            }
                          />
                          {customerId !== null ? (
                            <Button
                              type="button"
                              variant={editingId === product.id ? "default" : "outline"}
                              size="icon"
                              className="h-10 w-10 shrink-0"
                              title={
                                editingId === product.id
                                  ? "Guardar precio del cliente"
                                  : "Editar precio del cliente"
                              }
                              onClick={() => {
                                if (editingId === product.id) {
                                  commitPrice(product.id, product.price);
                                  setEditingId(null);
                                } else {
                                  setEditingId(product.id);
                                }
                              }}
                            >
                              {editingId === product.id ? <Check /> : <Pencil />}
                            </Button>
                          ) : null}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {customerId === null ? "Precio base" : "Precio del cliente"}
                        </span>
                      </div>

                      {/* Contador */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => setQty(product.id, qty - 1)}
                        >
                          <Minus />
                        </Button>
                        <Input
                          className="h-10 flex-1 text-center text-lg font-bold"
                          type="number"
                          min={0}
                          step="0.5"
                          value={qty}
                          onChange={(e) => setQty(product.id, Number(e.target.value))}
                        />
                        <Button
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => setQty(product.id, qty + 1)}
                        >
                          <Plus />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {!orderProducts.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No hay productos</p>
            ) : null}
          </CardContent>
        </Card>

        {/* Cliente: deslizador horizontal */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCustomerId(c.id)}
                  className={cn(
                    "w-64 shrink-0 rounded-xl border p-5 text-left transition-colors hover:bg-accent",
                    customerId === c.id && "border-primary bg-accent"
                  )}
                >
                  <p className="truncate text-lg font-semibold leading-tight">
                    {c.customer_name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {c.customer_category ?? "—"}
                  </p>
                </button>
              ))}
              {!filteredCustomers.length ? (
                <p className="py-4 text-sm text-muted-foreground">Sin clientes</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Derecha: repartidor / anticipo / total / crear */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pedido</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <div className="space-y-1">
              <Label>Cliente</Label>
              <p
                className={cn(
                  "font-bold",
                  !selectedCustomer && "font-normal text-muted-foreground"
                )}
              >
                {selectedCustomer?.customer_name ?? "Sin seleccionar"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Repartidor</Label>
              <Select value={dealer} onValueChange={setDealer}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  {dealers?.map((d) => (
                    <SelectItem key={d.id} value={d.username}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="advance">Anticipo / Pago</Label>
              <Input
                id="advance"
                type="number"
                min="0"
                step="0.01"
                value={advance}
                onChange={(e) => setAdvance(e.target.value)}
              />
            </div>

            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between rounded-md bg-slate-800 px-4 py-3 text-white">
                <span className="text-sm opacity-80">TOTAL</span>
                <span className="text-2xl font-bold">{formatCurrency(total)}</span>
              </div>

              <Button className="w-full" size="lg" disabled={!canSave} onClick={handleSave}>
                {createOrder.isPending ? "Guardando..." : "Crear pedido"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

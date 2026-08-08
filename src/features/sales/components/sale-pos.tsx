"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Receipt, ShoppingCart, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { useProducts } from "@/features/products/hooks";
import type { Product } from "@/features/products/types";
import { useCreateSale } from "../hooks";

type Cart = { id: number; quantities: Record<number, number> };

export function SalePos() {
  const { data: products } = useProducts();
  const createSale = useCreateSale();

  // Varias ventas abiertas a la vez (cada una con su propio carrito)
  const [carts, setCarts] = useState<Cart[]>([{ id: 1, quantities: {} }]);
  const [activeId, setActiveId] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Producto cuya cantidad se está editando en el modal (draft en texto para decimales)
  const [qtyEdit, setQtyEdit] = useState<{ product: Product; value: string } | null>(null);
  const lastId = useRef(1);

  const activeCart = carts.find((c) => c.id === activeId) ?? carts[0];
  const quantities = activeCart?.quantities ?? {};

  const cartItems = useMemo(
    () => (products ?? []).filter((p) => (quantities[p.id] ?? 0) > 0),
    [products, quantities]
  );

  const total = cartItems.reduce((sum, p) => sum + p.price * (quantities[p.id] ?? 0), 0);

  const setQty = (productId: number, qty: number) => {
    // Redondea a 3 decimales (gramos) para evitar basura de punto flotante
    // como 0.39890000000000003 al sumar/restar o teclear pesos.
    const rounded = Math.round(qty * 1000) / 1000;
    setCarts((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        const next = { ...c.quantities };
        if (rounded <= 0) delete next[productId];
        else next[productId] = rounded;
        return { ...c, quantities: next };
      })
    );
  };

  const clear = () =>
    setCarts((prev) => prev.map((c) => (c.id === activeId ? { ...c, quantities: {} } : c)));

  const applyQtyEdit = () => {
    if (!qtyEdit) return;
    const parsed = parseFloat(qtyEdit.value);
    setQty(qtyEdit.product.id, Number.isNaN(parsed) ? 0 : parsed);
    setQtyEdit(null);
  };

  const MAX_CARTS = 5;

  const addCart = () => {
    if (carts.length >= MAX_CARTS) return;
    const newId = lastId.current + 1;
    lastId.current = newId;
    setCarts((prev) => [...prev, { id: newId, quantities: {} }]);
    setActiveId(newId);
  };

  const closeCart = (id: number) => {
    const remaining = carts.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const newId = lastId.current + 1;
      lastId.current = newId;
      setCarts([{ id: newId, quantities: {} }]);
      setActiveId(newId);
      return;
    }
    if (id === activeId) setActiveId(remaining[remaining.length - 1].id);
    setCarts(remaining);
  };

  const cobrar = () => {
    createSale.mutate(
      {
        items: cartItems.map((p) => ({
          product_id: p.id,
          quantity: quantities[p.id],
          unit_price: p.price,
        })),
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          closeCart(activeId);
        },
      }
    );
  };

  const canCobrar = cartItems.length > 0 && !createSale.isPending;

  return (
    <>
      {/* Encabezado con tabs de ventas al lado del título */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-1 text-2xl font-bold tracking-tight">Hacer venta</h1>

        {carts.map((c, index) => {
          const isActive = c.id === activeId;
          return (
            <div
              key={c.id}
              className={cn(
                "flex items-center gap-2 rounded-full border py-2 pl-4 text-sm shadow-sm transition-all",
                carts.length > 1 ? "pr-2" : "pr-5",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "bg-background hover:bg-accent hover:shadow"
              )}
            >
              <button
                type="button"
                className="flex items-center gap-2 font-medium"
                onClick={() => setActiveId(c.id)}
              >
                <Receipt className="h-4 w-4 opacity-80" />
                Venta {index + 1}
              </button>
              {carts.length > 1 ? (
                <button
                  type="button"
                  aria-label="Cerrar venta"
                  className={cn(
                    "rounded-full p-0.5 transition-colors",
                    isActive
                      ? "hover:bg-white/20"
                      : "text-muted-foreground hover:bg-black/10 hover:text-foreground"
                  )}
                  onClick={() => closeCart(c.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          );
        })}

        <Button
          variant="outline"
          className="rounded-full"
          onClick={addCart}
          disabled={carts.length >= MAX_CARTS}
          title={carts.length >= MAX_CARTS ? "Máximo 5 ventas abiertas" : undefined}
        >
          <Plus /> Nueva venta
        </Button>

        <Button asChild variant="outline" className="ml-auto">
          <Link href="/sales">
            <ArrowLeft /> Volver
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Productos */}
        <Card className="flex h-[calc(100vh-9rem)] flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Productos</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products?.map((product) => {
                const qty = quantities[product.id] ?? 0;
                const active = qty > 0;
                return (
                  <div
                    key={product.id}
                    className={cn(
                      "relative flex flex-col rounded-lg border p-2 transition-colors",
                      active && "border-green-500 bg-green-50"
                    )}
                  >
                    {/* Zonas táctiles de toda la altura: izquierda quita, derecha agrega */}
                    <button
                      type="button"
                      aria-label="Quitar uno"
                      onClick={() => setQty(product.id, qty - 1)}
                      className="absolute inset-y-0 left-0 z-10 w-1/2 rounded-l-lg active:bg-black/5"
                    />
                    <button
                      type="button"
                      aria-label="Agregar uno"
                      onClick={() => setQty(product.id, qty + 1)}
                      className="absolute inset-y-0 right-0 z-10 w-1/2 rounded-r-lg active:bg-green-500/10"
                    />

                    {/* Contenido (no intercepta el tap) */}
                    <div className="pointer-events-none flex flex-col items-center gap-0.5 py-1 text-center">
                      <span className="text-3xl">{product.icon}</span>
                      <p className="line-clamp-2 text-sm font-semibold leading-tight">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(product.price)}
                      </p>
                    </div>

                    {/* Cantidad: botón centrado que abre el modal para editar (decimales).
                        Va por encima de las zonas; los lados siguen sumando/restando. */}
                    <div className="pointer-events-none relative z-20 mt-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setQtyEdit({ product, value: qty ? String(qty) : "" })}
                        className="pointer-events-auto h-9 min-w-16 rounded-md border bg-background px-3 text-base font-semibold hover:bg-accent"
                      >
                        {qty}
                      </button>
                    </div>

                    {/* Pistas visuales en los bordes */}
                    <Minus className="pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                    <Plus className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                  </div>
                );
              })}
            </div>
            {!products?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay productos
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* Carrito */}
        <Card className="flex h-[calc(100vh-9rem)] flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5" /> Venta{" "}
              {carts.findIndex((c) => c.id === activeId) + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden">
            <div className="rounded-md bg-slate-800 py-2 text-center text-white">
              <p className="text-xs opacity-80">TOTAL</p>
              <p className="text-2xl font-bold">{formatCurrency(total)}</p>
            </div>

            <div className="flex-1 space-y-2.5 overflow-auto">
              {cartItems.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Carrito vacío
                </p>
              ) : (
                cartItems.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-tight">
                        {p.icon} {p.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quantities[p.id]} × {formatCurrency(p.price)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatCurrency(p.price * quantities[p.id])}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setQty(p.id, 0)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!canCobrar}
              onClick={() => setConfirmOpen(true)}
            >
              Cobrar
            </Button>
            <Button
              variant="outline"
              className="w-full text-destructive"
              disabled={cartItems.length === 0}
              onClick={clear}
            >
              Limpiar
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {cartItems.length} producto{cartItems.length === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Confirmación de cobro */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar cobro</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Cobrar esta venta por{" "}
            <strong className="text-foreground">{formatCurrency(total)}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={cobrar}
              disabled={createSale.isPending}
            >
              {createSale.isPending ? "Cobrando..." : "Sí, cobrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar la cantidad (acepta decimales / peso) */}
      <Dialog open={qtyEdit !== null} onOpenChange={(open) => !open && setQtyEdit(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>
              {qtyEdit?.product.icon} {qtyEdit?.product.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Cantidad</label>
            <Input
              type="text"
              inputMode="decimal"
              autoFocus
              value={qtyEdit?.value ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return; // números y un punto
                setQtyEdit((prev) => (prev ? { ...prev, value: raw } : prev));
              }}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => e.key === "Enter" && applyQtyEdit()}
              className="h-11 text-center text-lg font-semibold"
            />
            {qtyEdit && parseFloat(qtyEdit.value) > 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                Subtotal:{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(qtyEdit.product.price * parseFloat(qtyEdit.value))}
                </span>
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQtyEdit(null)}>
              Cancelar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={applyQtyEdit}>
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

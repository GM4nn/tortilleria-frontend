"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/utils";
import { useProducts } from "@/features/products/hooks";
import { useCreateSale } from "../hooks";

export function SalePos() {
  const { data: products } = useProducts();
  const createSale = useCreateSale();

  // product_id -> cantidad
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const cartItems = useMemo(
    () => (products ?? []).filter((p) => (quantities[p.id] ?? 0) > 0),
    [products, quantities]
  );

  const total = cartItems.reduce(
    (sum, p) => sum + p.price * (quantities[p.id] ?? 0),
    0
  );

  const setQty = (productId: number, qty: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });
  };

  const clear = () => setQuantities({});

  const cobrar = () => {
    createSale.mutate(
      {
        items: cartItems.map((p) => ({
          product_id: p.id,
          quantity: quantities[p.id],
          unit_price: p.price,
        })),
      },
      { onSuccess: () => clear() }
    );
  };

  const canCobrar = cartItems.length > 0 && !createSale.isPending;

  return (
    <>
      <PageHeader
        title="Hacer venta"
        description="Venta directa de mostrador"
        action={
          <Button asChild variant="outline">
            <Link href="/sales">
              <ArrowLeft /> Volver
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Productos */}
        <Card className="flex h-[calc(100vh-11rem)] flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Productos</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-2 overflow-auto">
            {products?.map((product) => {
              const qty = quantities[product.id] ?? 0;
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <span className="text-2xl">{product.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setQty(product.id, qty - 1)}
                    >
                      <Minus />
                    </Button>
                    <Input
                      className="h-9 w-16 text-center"
                      type="number"
                      min={0}
                      step="0.5"
                      value={qty}
                      onChange={(e) => setQty(product.id, Number(e.target.value))}
                    />
                    <Button
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setQty(product.id, qty + 1)}
                    >
                      <Plus />
                    </Button>
                  </div>
                </div>
              );
            })}
            {!products?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay productos
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* Carrito */}
        <Card className="flex h-[calc(100vh-11rem)] flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5" /> Carrito
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden">
            <div className="rounded-md bg-slate-800 py-3 text-center text-white">
              <p className="text-xs opacity-80">TOTAL</p>
              <p className="text-3xl font-bold">{formatCurrency(total)}</p>
            </div>

            <div className="flex-1 space-y-2 overflow-auto">
              {cartItems.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Carrito vacío
                </p>
              ) : (
                cartItems.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">
                        {p.icon} {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quantities[p.id]} × {formatCurrency(p.price)}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(p.price * quantities[p.id])}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
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
              onClick={cobrar}
            >
              {createSale.isPending ? "Cobrando..." : "Cobrar"}
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
    </>
  );
}

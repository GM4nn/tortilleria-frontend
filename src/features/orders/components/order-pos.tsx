"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { PosStepper } from "@/components/pos/pos-stepper";
import { ProductPickerCard } from "@/components/pos/product-picker-card";
import { cn, formatCurrency } from "@/lib/utils";
import {
  useCustomerPrices,
  useCustomers,
  useSetCustomerPrice,
} from "@/features/customers/hooks";
import { useDealers } from "@/features/dealers/hooks";
import { useProducts } from "@/features/products/hooks";
import { useCreateOrder } from "../hooks";

interface CartItem {
  product_id: number;
  name: string;
  icon: string;
  unit_price: number;
  quantity: number;
}

const STEPS = ["Cliente", "Productos", "Resumen"];

export function OrderPos() {
  const router = useRouter();
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  const { data: dealers } = useDealers();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [dealer, setDealer] = useState("");
  const [advance, setAdvance] = useState("0");
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: customerPrices } = useCustomerPrices(customerId);
  const setCustomerPrice = useSetCustomerPrice(customerId ?? 0);

  const priceMap = useMemo(() => {
    const map = new Map<number, number>();
    customerPrices?.forEach((price) => map.set(price.product_id, price.custom_price));
    return map;
  }, [customerPrices]);

  const selectedCustomer = customers?.find((c) => c.id === customerId) ?? null;

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers ?? [];
    return (customers ?? []).filter((c) => c.customer_name.toLowerCase().includes(term));
  }, [customers, search]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    [cart]
  );
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const selectCustomer = (id: number) => {
    if (id !== customerId) {
      setCustomerId(id);
      setCart([]);
    }
  };

  const addProduct = (
    productId: number,
    name: string,
    icon: string,
    unitPrice: number,
    quantity: number
  ) => {
    setCart((prev) => {
      const found = prev.find((item) => item.product_id === productId);
      if (found) {
        return prev.map((item) =>
          item.product_id === productId ? { ...item, unit_price: unitPrice, quantity } : item
        );
      }
      return [...prev, { product_id: productId, name, icon, unit_price: unitPrice, quantity }];
    });
  };

  const removeItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const handleSave = () => {
    if (customerId === null) return;
    createOrder.mutate(
      {
        customer_id: customerId,
        amount_paid: Number(advance) || 0,
        default_dealer: dealer || null,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      },
      { onSuccess: () => router.push("/orders/historial") }
    );
  };

  return (
    <>
      <PageHeader
        title="Nuevo pedido"
        description="Sigue los pasos para armar el pedido"
        action={
          <Button variant="outline" onClick={() => router.push("/orders")}>
            <ArrowLeft /> Volver
          </Button>
        }
      />

      <PosStepper steps={STEPS} current={step} onSelect={(index) => setStep(index)} />

      {/* Paso 1: Cliente */}
      {step === 0 ? (
        <Card>
          <CardContent className="space-y-4 p-4">
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="grid max-h-[calc(100vh-22rem)] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => selectCustomer(customer.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors hover:bg-accent",
                    customerId === customer.id && "border-primary bg-accent"
                  )}
                >
                  <p className="font-semibold leading-tight">{customer.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {customer.customer_category ?? "—"}
                  </p>
                </button>
              ))}
              {!filteredCustomers.length ? (
                <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                  Sin clientes
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Paso 2: Productos */}
      {step === 1 ? (
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="pb-1 text-sm text-muted-foreground">
              Productos para <strong>{selectedCustomer?.customer_name}</strong>
            </p>
            <div className="max-h-[calc(100vh-23rem)] space-y-2 overflow-y-auto pr-1">
              {products?.map((product) => {
                const cartItem = cart.find((item) => item.product_id === product.id);
                return (
                  <ProductPickerCard
                    key={product.id}
                    product={product}
                    customPrice={priceMap.get(product.id)}
                    inCart={Boolean(cartItem)}
                    cartQuantity={cartItem?.quantity}
                    cartUnitPrice={cartItem?.unit_price}
                    onAdd={addProduct}
                    onRemove={removeItem}
                    onSaveCustomPrice={(productId, price) =>
                      setCustomerPrice.mutate({ productId, price })
                    }
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Paso 3: Resumen */}
      {step === 2 ? (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="rounded-md border p-3 text-center">
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-medium">{selectedCustomer?.customer_name ?? "—"}</p>
            </div>

            <div className="max-h-[calc(100vh-30rem)] space-y-1 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Sin productos</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between gap-2 border-b py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">
                        {item.icon} {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                <Input id="advance" type="number" min="0" step="0.01" value={advance}
                  onChange={(e) => setAdvance(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Barra de navegación */}
      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="outline"
          size="lg"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ArrowLeft /> Atrás
        </Button>

        <div className="flex flex-1 items-center justify-center gap-3 rounded-md bg-slate-800 px-4 py-2 text-white">
          <span className="flex items-center gap-2 text-sm">
            <ShoppingCart className="h-4 w-4" />
            <Badge variant="secondary">
              {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
            </Badge>
          </span>
          <span className="text-xl font-bold">{formatCurrency(total)}</span>
        </div>

        {step < 2 ? (
          <Button size="lg" onClick={() => setStep((s) => Math.min(2, s + 1))}>
            Siguiente <ArrowRight />
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={cart.length === 0 || createOrder.isPending}
            onClick={handleSave}
          >
            {createOrder.isPending ? "Guardando..." : "Guardar pedido"}
          </Button>
        )}
      </div>
    </>
  );
}

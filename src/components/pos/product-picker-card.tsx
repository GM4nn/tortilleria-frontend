"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";

interface Product {
  id: number;
  icon: string;
  name: string;
  price: number;
}

export function ProductPickerCard({
  product,
  customPrice,
  inCart = false,
  onAdd,
  onRemove,
  onSaveCustomPrice,
}: {
  product: Product;
  customPrice?: number;
  inCart?: boolean;
  onAdd: (
    productId: number,
    name: string,
    icon: string,
    unitPrice: number,
    quantity: number
  ) => void;
  onRemove?: (productId: number) => void;
  onSaveCustomPrice?: (productId: number, price: number) => void;
}) {
  const [price, setPrice] = useState(String(customPrice ?? product.price));
  const [quantity, setQuantity] = useState("1");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setPrice(String(customPrice ?? product.price));
  }, [customPrice, product.price, editing]);

  const toggleEdit = () => {
    if (editing) {
      const value = Number(price);
      if (value > 0) onSaveCustomPrice?.(product.id, value);
    }
    setEditing((prev) => !prev);
  };

  const handleAdd = () => {
    const unitPrice = Number(price) || product.price;
    const qty = Math.max(1, Number(quantity) || 1);
    onAdd(product.id, product.name, product.icon, unitPrice, qty);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-lg border p-3 transition-colors",
        inCart && "border-2 border-green-500 bg-green-50"
      )}
    >
      <div className="min-w-40 flex-1 self-center pl-2">
        <p className="font-semibold leading-tight">
          {product.icon} {product.name}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Precio base: {formatCurrency(product.price)}
          {inCart ? " · En el pedido" : ""}
        </p>
      </div>

      <div className="flex items-end gap-1">
        <div>
          <label className="text-xs text-muted-foreground">Precio</label>
          <Input
            className="h-9 w-24"
            type="number"
            step="0.01"
            min="0"
            value={price}
            disabled={!editing}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        {onSaveCustomPrice ? (
          <Button
            type="button"
            variant={editing ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            title={editing ? "Guardar precio del cliente" : "Editar precio"}
            onClick={toggleEdit}
          >
            {editing ? <Check /> : <Pencil />}
          </Button>
        ) : null}
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Cantidad</label>
        <Input
          className="h-9 w-20"
          type="number"
          min="1"
          step="0.01"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <Button type="button" className="h-9" onClick={handleAdd}>
        <Plus /> Agregar
      </Button>

      {inCart && onRemove ? (
        <Button
          type="button"
          variant="outline"
          className="h-9 text-destructive"
          onClick={() => onRemove(product.id)}
        >
          <X /> Quitar
        </Button>
      ) : null}
    </div>
  );
}

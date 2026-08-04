"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { useSuppliers } from "@/features/suppliers/hooks";
import {
  useAddPurchase,
  usePurchase,
  useReferencePurchase,
  useSupply,
  useUpdatePurchase,
} from "../hooks";

export function AddPurchaseView({
  supplyId,
  purchaseId,
}: {
  supplyId: number;
  purchaseId?: number;
}) {
  const router = useRouter();
  const { data: supply } = useSupply(supplyId);
  const { data: suppliers } = useSuppliers();
  const { data: purchase } = usePurchase(supplyId, purchaseId);
  // Compra de referencia (periodo anterior): la más reciente al crear,
  // o la inmediatamente anterior a la editada. La resuelve el backend.
  const { data: referencePurchase } = useReferencePurchase(supplyId, purchaseId);
  const add = useAddPurchase(supplyId);
  const update = useUpdatePurchase(supplyId);

  const isEdit = purchaseId != null;

  const [supplierId, setSupplierId] = useState("");
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [remaining, setRemaining] = useState("0");
  const [notes, setNotes] = useState("");

  const total = (Number(quantity) || 0) * (Number(unitPrice) || 0);

  const available = referencePurchase
    ? (referencePurchase.remaining || 0) + referencePurchase.quantity
    : 0;

  const remainingNum = Number(remaining) || 0;
  const consumed = available - remainingNum;
  const consumedPct = available > 0 ? (consumed / available) * 100 : 0;
  const remainingNegative = remainingNum < 0;
  const remainingExceeds = Boolean(referencePurchase) && remainingNum > available;
  const remainingInvalid = remainingNegative || remainingExceeds;

  // Inicializa el formulario cuando cargan el insumo/compra
  useEffect(() => {
    if (purchase) {
      setSupplierId(String(purchase.supplier_id));
      setDate(purchase.purchase_date ?? "");
      setQuantity(String(purchase.quantity));
      setUnitPrice(String(purchase.unit_price));
      setRemaining(String(purchase.remaining));
      setNotes(purchase.notes ?? "");
    } else if (!isEdit) {
      setSupplierId(supply?.supplier_id ? String(supply.supplier_id) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchase?.id, supply?.id]);

  const backToDetail = () => router.push(`/supplies/${supplyId}`);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!supply || !supplierId) return;
    const data = {
      supplier_id: Number(supplierId),
      quantity: Number(quantity) || 0,
      unit: supply.unit,
      unit_price: Number(unitPrice) || 0,
      total_price: total,
      remaining: Number(remaining) || 0,
      purchase_date: date || null,
      notes: notes || null,
    };
    const opts = { onSuccess: () => backToDetail() };
    if (purchase) {
      update.mutate({ purchaseId: purchase.id, data }, opts);
    } else {
      add.mutate(data, opts);
    }
  };

  const unit = supply?.unit ?? "";
  const pending = add.isPending || update.isPending;

  return (
    <>
      <PageHeader
        title={isEdit ? "Editar compra de insumo" : "Registrar compra de insumo"}
        description={supply?.supply_name}
        action={
          <Button variant="outline" onClick={backToDetail}>
            <ArrowLeft /> Volver
          </Button>
        }
      />

      <Card className="-mt-4">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* IZQUIERDA: datos de la compra */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Insumo</Label>
                    <p className="font-semibold text-primary">{supply?.supply_name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label>Unidad</Label>
                    <p className="font-semibold text-primary">{unit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Proveedor</Label>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers?.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.supplier_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Fecha de compra</Label>
                    <DatePicker value={date} onChange={(v) => setDate(v ?? "")} placeholder="Hoy" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="quantity">Cantidad ({unit})</Label>
                    <Input id="quantity" type="number" step="0.01" value={quantity}
                      onChange={(e) => setQuantity(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="unit_price">Precio unitario</Label>
                    <Input id="unit_price" type="number" step="0.01" value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Total</Label>
                  <Input value={formatCurrency(total)} readOnly disabled />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>

              {/* DERECHA: consumo del periodo anterior */}
              <div className="space-y-3 rounded-md border p-4">
                <div>
                  <p className="font-semibold text-amber-600">Consumo del periodo anterior</p>
                  <p className="text-xs text-muted-foreground">
                    Ingresa cuánto te sobró del periodo anterior
                  </p>
                </div>

                {referencePurchase ? (
                  <>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Última compra: </span>
                      <span className="font-medium">
                        {formatDateShort(referencePurchase.purchase_date)}
                      </span>{" "}
                      <span className="text-primary">
                        ({referencePurchase.quantity} {unit})
                      </span>
                    </p>

                    <div className="rounded-md border border-primary/40 p-3 text-center">
                      <p className="text-xs text-primary">Total disponible en el periodo</p>
                      <p className="text-2xl font-bold text-primary">
                        {available.toFixed(2)} {unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {referencePurchase.remaining > 0
                          ? `${referencePurchase.quantity} comprados + ${referencePurchase.remaining} sobrantes`
                          : `Solo los ${referencePurchase.quantity} comprados`}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Primera compra (sin periodo anterior).
                  </p>
                )}

                <div className="space-y-1">
                  <Label htmlFor="remaining">¿Cuánto sobró?</Label>
                  <Input id="remaining" type="number" step="0.01" value={remaining}
                    onChange={(e) => setRemaining(e.target.value)} />
                </div>

                {referencePurchase ? (
                  remainingNegative ? (
                    <p className="text-sm text-destructive">
                      El restante no puede ser negativo
                    </p>
                  ) : remainingExceeds ? (
                    <p className="text-sm text-destructive">
                      No puede sobrar más de lo disponible ({available.toFixed(2)})
                    </p>
                  ) : (
                    <div className="text-sm">
                      <p className="text-blue-600">
                        Consumido: {consumed.toFixed(2)} ({consumedPct.toFixed(0)}%)
                      </p>
                      <p className="text-green-600">
                        Gastaste {consumed.toFixed(2)} + Sobró {remainingNum.toFixed(2)} ={" "}
                        {available.toFixed(2)}
                      </p>
                    </div>
                  )
                ) : null}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={backToDetail}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending || !supplierId || remainingInvalid}>
                {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar compra"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

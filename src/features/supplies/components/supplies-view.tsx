"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useSuppliers } from "@/features/suppliers/hooks";
import { useDeleteSupply, useSupplies } from "../hooks";
import type { Supply } from "../types";
import { SupplyFormDialog } from "./supply-form-dialog";
import { SupplyPurchasesDialog } from "./supply-purchases-dialog";

export function SuppliesView() {
  const { data: supplies, isLoading } = useSupplies();
  const { data: suppliers } = useSuppliers();
  const deleteSupply = useDeleteSupply();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supply | null>(null);
  const [purchasesFor, setPurchasesFor] = useState<Supply | null>(null);

  const supplierName = useMemo(() => {
    const map = new Map<number, string>();
    suppliers?.forEach((s) => map.set(s.id, s.supplier_name));
    return map;
  }, [suppliers]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (supply: Supply) => {
    setEditing(supply);
    setFormOpen(true);
  };

  const handleDelete = (supply: Supply) => {
    if (supply.is_default) return;
    if (confirm(`¿Eliminar el insumo "${supply.supply_name}"?`)) {
      deleteSupply.mutate(supply.id);
    }
  };

  return (
    <>
      <PageHeader
        title="Insumos"
        description="Catálogo de insumos y sus compras"
        action={
          <Button onClick={openCreate}>
            <Plus /> Nuevo
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Insumo</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <CenteredSpinner />
                </TableCell>
              </TableRow>
            ) : !supplies?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No hay insumos
                </TableCell>
              </TableRow>
            ) : (
              supplies.map((supply) => (
                <TableRow key={supply.id}>
                  <TableCell className="font-medium">{supply.supply_name}</TableCell>
                  <TableCell>{supplierName.get(supply.supplier_id) ?? "—"}</TableCell>
                  <TableCell>{supply.unit}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Compras"
                        onClick={() => setPurchasesFor(supply)}
                      >
                        <ShoppingBag />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(supply)}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        disabled={supply.is_default}
                        onClick={() => handleDelete(supply)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <SupplyFormDialog open={formOpen} onOpenChange={setFormOpen} supply={editing} />
      <SupplyPurchasesDialog
        supply={purchasesFor}
        open={purchasesFor !== null}
        onOpenChange={(open) => !open && setPurchasesFor(null)}
      />
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { CenteredSpinner } from "@/components/ui/spinner";
import { useSuppliers } from "@/features/suppliers/hooks";
import { useSupplies } from "../hooks";
import type { Supply } from "../types";
import { SupplyFormDialog } from "./supply-form-dialog";

export function SuppliesView() {
  const { data: supplies, isLoading } = useSupplies();
  const { data: suppliers } = useSuppliers();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supply | null>(null);

  const supplierName = useMemo(() => {
    const map = new Map<number, string>();
    suppliers?.forEach((s) => map.set(s.id, s.supplier_name));
    return map;
  }, [suppliers]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return supplies ?? [];
    return (supplies ?? []).filter((s) =>
      s.supply_name.toLowerCase().includes(term)
    );
  }, [supplies, search]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (supply: Supply) => {
    setEditing(supply);
    setFormOpen(true);
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

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Buscar insumo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <CenteredSpinner />
      ) : !filtered.length ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No hay insumos
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((supply) => (
            <Card key={supply.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold leading-tight">
                      {supply.supply_name}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({supply.unit})
                      </span>
                    </p>
                    {supply.is_default ? (
                      <Badge variant="warning" className="mt-1">
                        Sistema
                      </Badge>
                    ) : null}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    title="Editar"
                    onClick={() => openEdit(supply)}
                  >
                    <Pencil />
                  </Button>
                </div>

                <p className="mt-3 text-sm">
                  <span className="text-muted-foreground">Proveedor: </span>
                  <span className="font-medium">
                    {supplierName.get(supply.supplier_id ?? -1) ?? "—"}
                  </span>
                </p>

                <div className="mt-4 border-t pt-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/supplies/${supply.id}`}>Ver detalles</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SupplyFormDialog open={formOpen} onOpenChange={setFormOpen} supply={editing} />
    </>
  );
}

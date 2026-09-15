"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, MapPin, Pencil, Play, Plus, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { CenteredSpinner } from "@/components/ui/spinner";
import { useCustomers } from "@/features/customers/hooks";
import { useDealers } from "@/features/dealers/hooks";
import { useDeleteRoute, useRoutes } from "@/features/routes/hooks";
import { RouteFormDialog } from "@/features/routes/components/route-form-dialog";
import type { Route } from "@/features/routes/types";
import { useGenerateToday } from "@/features/schedules/hooks";

export function PedidosHome() {
  const router = useRouter();
  const { data: routes, isLoading } = useRoutes();
  const { data: customers } = useCustomers();
  const { data: dealers } = useDealers();
  const deleteRoute = useDeleteRoute();
  const generate = useGenerateToday();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null);

  const dealerName = useMemo(() => {
    const map = new Map<string, string>();
    dealers?.forEach((d) => map.set(d.username, d.name));
    return map;
  }, [dealers]);

  const countByRoute = useMemo(() => {
    const map = new Map<number, number>();
    customers?.forEach((c) => {
      if (c.route_id != null) map.set(c.route_id, (map.get(c.route_id) ?? 0) + 1);
    });
    return map;
  }, [customers]);

  const unassigned = useMemo(
    () => (customers ?? []).filter((c) => c.route_id == null).length,
    [customers]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteRoute.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Zonas de reparto: cada cliente con sus días y kilos, en el mapa"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
              title="Generar los pedidos de hoy a partir de los programados"
            >
              <Play /> {generate.isPending ? "Generando..." : "Generar hoy"}
            </Button>
            <Button onClick={openCreate}>
              <Plus /> Nueva zona
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <CenteredSpinner />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(routes ?? []).map((route) => (
            <Card
              key={route.id}
              className="group flex cursor-pointer flex-col gap-3 p-4 transition-colors hover:border-primary hover:bg-accent"
              onClick={() => router.push(`/orders/${route.id}`)}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 h-4 w-4 shrink-0 rounded-full"
                  style={{ background: route.color ?? "#999" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold">{route.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {route.dealers?.length
                      ? route.dealers
                          .map((u) => dealerName.get(u) ?? u)
                          .join(", ")
                      : "Sin repartidor"}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {countByRoute.get(route.id) ?? 0} clientes
                </span>
                <div
                  className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(route);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeleteTarget(route)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Clientes sin zona */}
          {unassigned > 0 ? (
            <Card
              className="flex cursor-pointer flex-col justify-center gap-2 border-dashed p-4 text-muted-foreground transition-colors hover:border-primary hover:bg-accent"
              onClick={() => router.push(`/orders/sin-zona`)}
            >
              <span className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4" /> Sin zona
              </span>
              <span className="text-sm">{unassigned} clientes por asignar</span>
            </Card>
          ) : null}

          {!routes?.length && unassigned === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No hay zonas todavía. Crea una con “Nueva zona”.
            </div>
          ) : null}
        </div>
      )}

      <RouteFormDialog open={formOpen} onOpenChange={setFormOpen} route={editing} />

      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar zona</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Eliminar la zona{" "}
            <strong className="text-foreground">{deleteTarget?.name}</strong>? Los clientes de
            esta zona quedarán sin zona (no se borran).
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteRoute.isPending}
            >
              {deleteRoute.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

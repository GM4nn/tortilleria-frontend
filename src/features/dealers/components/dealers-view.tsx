"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useDealers, useDeleteDealer } from "../hooks";
import type { Dealer } from "../types";
import { DealerFormDialog } from "./dealer-form-dialog";

export function DealersView() {
  const { data: dealers, isLoading } = useDealers();
  const deleteDealer = useDeleteDealer();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Dealer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dealer | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (dealer: Dealer) => {
    setEditing(dealer);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteDealer.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <>
      <PageHeader
        title="Repartidores"
        description="Gestiona los repartidores y su acceso a la app móvil"
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
              <TableHead>Nombre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>PIN</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <CenteredSpinner />
                </TableCell>
              </TableRow>
            ) : !dealers?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No hay repartidores
                </TableCell>
              </TableRow>
            ) : (
              dealers.map((dealer) => (
                <TableRow key={dealer.id}>
                  <TableCell className="font-medium">{dealer.name}</TableCell>
                  <TableCell>{dealer.username}</TableCell>
                  <TableCell>{dealer.pin}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(dealer)}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(dealer)}
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

      <DealerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dealer={editing}
      />

      {/* Confirmación de eliminación */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar repartidor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Seguro que quieres eliminar a{" "}
            <strong className="text-foreground">{deleteTarget?.name}</strong>? Esta acción no
            se puede deshacer.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteDealer.isPending}
            >
              {deleteDealer.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

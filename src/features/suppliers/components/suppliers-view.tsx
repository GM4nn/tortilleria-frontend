"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

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
import { useDeleteSupplier, useSuppliersPaginated } from "../hooks";
import type { Supplier } from "../types";
import { SupplierFormDialog } from "./supplier-form-dialog";

const PAGE_SIZE = 10;

export function SuppliersView() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSuppliersPaginated(page, PAGE_SIZE);
  const deleteSupplier = useDeleteSupplier();

  const suppliers = data?.data ?? [];
  const total = data?.pagination.total_data ?? 0;
  const totalPages = data?.pagination.total_pages ?? 1;
  const currentPage = Math.min(page, totalPages);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setDialogOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    if (supplier.is_default) return;
    if (confirm(`¿Eliminar al proveedor "${supplier.supplier_name}"?`)) {
      deleteSupplier.mutate(supplier.id);
    }
  };

  return (
    <>
      <PageHeader
        title="Proveedores"
        description="Directorio de proveedores"
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
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <CenteredSpinner />
                </TableCell>
              </TableRow>
            ) : !suppliers.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay proveedores
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                  <TableCell>{supplier.contact_name ?? "—"}</TableCell>
                  <TableCell>{supplier.phone ?? "—"}</TableCell>
                  <TableCell>{supplier.product_type ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(supplier)}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        disabled={supplier.is_default}
                        onClick={() => handleDelete(supplier)}
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

      {/* Paginación */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} proveedor{total === 1 ? "" : "es"} · Página {currentPage} de {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft /> Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Siguiente <ChevronRight />
          </Button>
        </div>
      </div>

      <SupplierFormDialog open={dialogOpen} onOpenChange={setDialogOpen} supplier={editing} />
    </>
  );
}

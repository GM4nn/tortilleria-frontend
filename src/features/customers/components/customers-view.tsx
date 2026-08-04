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
import { useCustomersPaginated, useDeleteCustomer } from "../hooks";
import type { Customer } from "../types";
import { CustomerFormDialog } from "./customer-form-dialog";

const PAGE_SIZE = 10;

export function CustomersView() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCustomersPaginated(page, PAGE_SIZE);
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.data ?? [];
  const total = data?.pagination.total_data ?? 0;
  const totalPages = data?.pagination.total_pages ?? 1;
  const currentPage = Math.min(page, totalPages);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setDialogOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    if (confirm(`¿Eliminar al cliente "${customer.customer_name}"?`)) {
      deleteCustomer.mutate(customer.id);
    }
  };

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Directorio de clientes de la tortillería"
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
              <TableHead>Teléfono</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Dirección</TableHead>
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
            ) : !customers.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay clientes
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.customer_name}</TableCell>
                  <TableCell>{customer.customer_phone ?? "—"}</TableCell>
                  <TableCell>{customer.customer_category ?? "—"}</TableCell>
                  <TableCell>{customer.customer_direction ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(customer)}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(customer)}
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
          {total} cliente{total === 1 ? "" : "s"} · Página {currentPage} de {totalPages}
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

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editing}
      />
    </>
  );
}

"use client";

import Link from "next/link";
import { ClipboardList, ShoppingCart } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export function OrdersHome() {
  return (
    <>
      <PageHeader title="Pedidos" description="Gestión de pedidos" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/orders/new">
          <Card className="flex h-48 flex-col items-center justify-center gap-3 transition-colors hover:border-primary hover:bg-accent">
            <ShoppingCart className="h-12 w-12 text-primary" />
            <span className="text-xl font-semibold">Hacer pedido</span>
          </Card>
        </Link>

        <Link href="/orders/historial">
          <Card className="flex h-48 flex-col items-center justify-center gap-3 transition-colors hover:border-primary hover:bg-accent">
            <ClipboardList className="h-12 w-12 text-primary" />
            <span className="text-xl font-semibold">Historial de pedidos</span>
          </Card>
        </Link>
      </div>
    </>
  );
}

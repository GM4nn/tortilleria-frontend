"use client";

import Link from "next/link";
import { ClipboardList, ShoppingCart } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export function SalesHome() {
  return (
    <>
      <PageHeader title="Ventas" description="Ventas de mostrador" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/sales/nueva">
          <Card className="flex h-48 flex-col items-center justify-center gap-3 transition-colors hover:border-primary hover:bg-accent">
            <ShoppingCart className="h-12 w-12 text-primary" />
            <span className="text-xl font-semibold">Hacer venta</span>
          </Card>
        </Link>

        <Link href="/sales/historial">
          <Card className="flex h-48 flex-col items-center justify-center gap-3 transition-colors hover:border-primary hover:bg-accent">
            <ClipboardList className="h-12 w-12 text-primary" />
            <span className="text-xl font-semibold">Ver ventas</span>
          </Card>
        </Link>
      </div>
    </>
  );
}

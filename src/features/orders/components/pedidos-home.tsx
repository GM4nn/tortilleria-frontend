"use client";

import Link from "next/link";
import { ClipboardList, Map } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export function PedidosHome() {
  return (
    <>
      <PageHeader title="Pedidos" description="Zonas de reparto y historial de pedidos" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/orders/zonas">
          <Card className="flex h-48 flex-col items-center justify-center gap-3 transition-colors hover:border-primary hover:bg-accent">
            <Map className="h-12 w-12 text-primary" />
            <span className="text-xl font-semibold">Zonas de reparto</span>
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

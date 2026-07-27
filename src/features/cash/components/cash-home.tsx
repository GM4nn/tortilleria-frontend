"use client";

import Link from "next/link";
import { ClipboardList, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export function CashHome() {
  return (
    <>
      <PageHeader title="Caja" description="Corte del día y arqueo" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/cash/corte">
          <Card className="flex h-48 flex-col items-center justify-center gap-3 transition-colors hover:border-primary hover:bg-accent">
            <Wallet className="h-12 w-12 text-primary" />
            <span className="text-xl font-semibold">Hacer corte</span>
          </Card>
        </Link>

        <Link href="/cash/historial">
          <Card className="flex h-48 flex-col items-center justify-center gap-3 transition-colors hover:border-primary hover:bg-accent">
            <ClipboardList className="h-12 w-12 text-primary" />
            <span className="text-xl font-semibold">Historial de cortes</span>
          </Card>
        </Link>
      </div>
    </>
  );
}

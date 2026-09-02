"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function downloadTemplate() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const res = await fetch(`${API_BASE}/reports/insumos-template`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok) throw new Error("No se pudo descargar la plantilla");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla-insumos.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function FinanceView() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadTemplate();
      toast.success("Plantilla descargada");
    } catch {
      toast.error("No se pudo descargar la plantilla");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Finanzas"
        description="Lleva tus insumos en una plantilla de Excel y analiza cómo va el negocio"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Descargar plantilla */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              Plantilla de insumos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Descarga esta plantilla de Excel y ve anotando tus insumos: lo que
              <strong className="text-foreground"> compras</strong> y lo que
              <strong className="text-foreground"> consumes</strong> (con fecha,
              cantidad y precio). Tiene un formato fijo para poder analizarla después.
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download />
              {downloading ? "Generando..." : "Descargar plantilla"}
            </Button>
          </CardContent>
        </Card>

        {/* Cargar y analizar (próximamente) */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-5 w-5" />
              Cargar y analizar
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                Próximamente
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Aquí podrás <strong className="text-foreground">subir tu plantilla llena</strong> y
              el sistema la analizará automáticamente: compara tus compras y consumo de
              insumos contra las <strong className="text-foreground">ventas y pedidos</strong> del
              sistema, y te dice cómo va el negocio.
            </p>
            <Button variant="outline" disabled>
              <Upload />
              Cargar plantilla
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

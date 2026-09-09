"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUSTOMER_CATEGORY_MOSTRADOR, useMeta } from "@/features/meta/hooks";
import { useRoutes } from "@/features/routes/hooks";
import { useSaveCustomer } from "../hooks";
import type { Customer } from "../types";

const NO_ROUTE = "__none__";

const EMPTY = {
  customer_name: "",
  customer_direction: "",
  customer_category: "",
  customer_phone: "",
  latitude: "",
  longitude: "",
  route_id: "",
};

// Extrae coordenadas de un link de Google Maps (portado de index(2).html)
function extractCoords(url: string): { lat: number; lng: number } | null {
  const precise = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (precise) return { lat: parseFloat(precise[1]), lng: parseFloat(precise[2]) };
  const patterns = [
    /\?q=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /query=(-?\d+\.\d+)%2C(-?\d+\.\d+)/,
    /query=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
  ];
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  }
  return null;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}) {
  const [form, setForm] = useState(EMPTY);
  const [mapsLink, setMapsLink] = useState("");
  const save = useSaveCustomer();
  const { data: meta } = useMeta();
  const { data: routes } = useRoutes();
  const categories = (meta?.customer_categories ?? []).filter(
    (c) => c !== CUSTOMER_CATEGORY_MOSTRADOR
  );

  useEffect(() => {
    if (open) {
      setMapsLink("");
      setForm(
        customer
          ? {
              customer_name: customer.customer_name,
              customer_direction: customer.customer_direction ?? "",
              customer_category: customer.customer_category ?? "",
              customer_phone: customer.customer_phone ?? "",
              latitude: customer.latitude != null ? String(customer.latitude) : "",
              longitude: customer.longitude != null ? String(customer.longitude) : "",
              route_id: customer.route_id != null ? String(customer.route_id) : "",
            }
          : EMPTY
      );
    }
  }, [open, customer]);

  const applyMapsLink = () => {
    const coords = extractCoords(mapsLink.trim());
    if (!coords) {
      toast.error("No se encontraron coordenadas. Usa el link largo de Google Maps.");
      return;
    }
    setForm((f) => ({
      ...f,
      latitude: String(coords.lat),
      longitude: String(coords.lng),
    }));
    toast.success("Ubicación extraída");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    save.mutate(
      {
        id: customer?.id,
        data: {
          customer_name: form.customer_name,
          customer_direction: form.customer_direction || null,
          customer_category: form.customer_category || null,
          customer_phone: form.customer_phone || null,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
          route_id: form.route_id ? Number(form.route_id) : null,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{customer ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="min-w-0 space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="customer_name">Nombre</Label>
              <Input
                id="customer_name"
                className="w-full min-w-0"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                required
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="customer_phone">Teléfono</Label>
              <Input
                id="customer_phone"
                className="w-full min-w-0"
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="customer_direction">Dirección</Label>
              <Input
                id="customer_direction"
                className="w-full min-w-0"
                value={form.customer_direction}
                onChange={(e) => setForm({ ...form, customer_direction: e.target.value })}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label>Categoría</Label>
              <Select
                value={form.customer_category}
                onValueChange={(v) => setForm({ ...form, customer_category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ubicación + ruta */}
          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-sm font-medium">Ubicación y ruta</p>
            <div className="space-y-2">
              <Label htmlFor="maps_link">Link de Google Maps</Label>
              <div className="flex gap-2">
                <Input
                  id="maps_link"
                  className="min-w-0 flex-1"
                  placeholder="Pega el link de Google Maps del cliente…"
                  value={mapsLink}
                  onChange={(e) => setMapsLink(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={applyMapsLink}>
                  Extraer
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Usa el link largo (no el corto maps.app.goo.gl) para que traiga las coordenadas.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="latitude">Latitud</Label>
                <Input
                  id="latitude"
                  className="w-full min-w-0"
                  inputMode="decimal"
                  placeholder="19.4326"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="longitude">Longitud</Label>
                <Input
                  id="longitude"
                  className="w-full min-w-0"
                  inputMode="decimal"
                  placeholder="-99.1332"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
              <div className="min-w-0 space-y-2">
                <Label>Ruta / Zona</Label>
                <Select
                  value={form.route_id || NO_ROUTE}
                  onValueChange={(v) =>
                    setForm({ ...form, route_id: v === NO_ROUTE ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin ruta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_ROUTE}>Sin ruta</SelectItem>
                    {routes?.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

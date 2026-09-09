"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Customer } from "@/features/customers/types";

export function ZoneMap({
  customers,
  color,
}: {
  customers: Customer[];
  color: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          zoomControl: true,
        }).setView([19.43, -99.13], 12);
        // OpenStreetMap: gratis y sin API key
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap",
        }).addTo(mapRef.current);
        layerRef.current = L.layerGroup().addTo(mapRef.current);
      }

      layerRef.current.clearLayers();

      const withCoords = customers.filter(
        (c) => c.latitude != null && c.longitude != null
      );

      withCoords.forEach((c, idx) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:24px;height:24px;background:${color};border:2px solid rgba(255,255,255,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#000;box-shadow:0 0 8px ${color},0 2px 6px rgba(0,0,0,0.5)">${idx + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        });
        const marker = L.marker([c.latitude as number, c.longitude as number], { icon });
        const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`;
        marker.bindPopup(
          `<div style="min-width:150px">
            <div style="font-weight:600;margin-bottom:6px">${c.customer_name}</div>
            <a href="${gmaps}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:8px;background:${color};color:#fff;text-decoration:none;font-size:12px;font-weight:500">📍 Cómo llegar</a>
          </div>`,
          { maxWidth: 220 }
        );
        marker.addTo(layerRef.current);
      });

      if (withCoords.length) {
        const bounds = L.latLngBounds(
          withCoords.map((c) => [c.latitude as number, c.longitude as number])
        );
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
      setTimeout(() => mapRef.current?.invalidateSize(), 120);
    })();
    return () => {
      cancelled = true;
    };
  }, [customers, color]);

  // Limpieza al desmontar
  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    []
  );

  return <div ref={containerRef} className="h-full w-full" style={{ background: "#e5e7eb" }} />;
}

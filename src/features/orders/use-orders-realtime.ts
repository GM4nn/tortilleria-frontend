"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

// Abre un WebSocket mientras el componente esté montado (ej. historial de pedidos)
// y refresca la lista cuando el backend avisa de un cambio (abonos del móvil).
export function useOrdersRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return;

    const url = `${BASE.replace(/^http/, "ws")}/ws/orders?token=${token}`;
    let socket: WebSocket | null = null;
    let closed = false;
    let retry: ReturnType<typeof setTimeout>;

    const connect = () => {
      socket = new WebSocket(url);
      socket.onmessage = () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      };
      socket.onclose = () => {
        if (!closed) retry = setTimeout(connect, 3000); // reconexión simple
      };
    };

    connect();

    return () => {
      closed = true;
      clearTimeout(retry);
      socket?.close();
    };
  }, [queryClient]);
}

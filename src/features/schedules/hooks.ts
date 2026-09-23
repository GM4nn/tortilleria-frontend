"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { schedulesApi } from "./api";
import type { ScheduledOrderInput } from "./types";

const QUERY_KEY = ["scheduled-orders"];

export function useSchedules() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: schedulesApi.list });
}

export function useSaveSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: ScheduledOrderInput }) =>
      id ? schedulesApi.update(id, data) : schedulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Pedido programado guardado");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al guardar"),
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schedulesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Pedido programado eliminado");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al eliminar"),
  });
}

export function useGenerateToday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = await schedulesApi.generateToday();
      await schedulesApi.syncToday();
      return result;
    },
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(`Pedidos generados: ${r.created} (omitidos: ${r.skipped})`);
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al generar"),
  });
}

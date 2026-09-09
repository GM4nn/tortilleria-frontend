"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { routesApi } from "./api";
import type { RouteInput } from "./types";

const QUERY_KEY = ["routes"];

export function useRoutes() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: routesApi.list });
}

export function useSaveRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: RouteInput }) =>
      id ? routesApi.update(id, data) : routesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Ruta guardada");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al guardar"),
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => routesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Ruta eliminada");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al eliminar"),
  });
}

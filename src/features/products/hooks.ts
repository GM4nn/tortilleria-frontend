"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { productsApi } from "./api";
import type { ProductInput } from "./types";

const QUERY_KEY = ["products"];

export function useProducts() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: productsApi.list });
}

export function useSaveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: ProductInput }) =>
      id ? productsApi.update(id, data) : productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Producto guardado");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al guardar"),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Producto eliminado");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al eliminar"),
  });
}

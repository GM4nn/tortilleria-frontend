"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { suppliersApi } from "./api";
import type { SupplierInput } from "./types";

const QUERY_KEY = ["suppliers"];

export function useSuppliers() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: suppliersApi.list });
}

export function useSaveSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: SupplierInput }) =>
      id ? suppliersApi.update(id, data) : suppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Proveedor guardado");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al guardar"),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => suppliersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Proveedor eliminado");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al eliminar"),
  });
}

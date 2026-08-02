"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { suppliesApi } from "./api";
import type { SupplyInput, SupplyPurchaseInput } from "./types";

const QUERY_KEY = ["supplies"];

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function useSupplies() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: suppliesApi.list });
}

export function useSupply(supplyId: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, supplyId],
    queryFn: () => suppliesApi.get(supplyId),
  });
}

export function useSaveSupply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: SupplyInput }) =>
      id ? suppliesApi.update(id, data) : suppliesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Insumo guardado");
    },
    onError: (error) => toast.error(errorMessage(error, "Error al guardar")),
  });
}

export function useDeleteSupply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => suppliesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Insumo eliminado");
    },
    onError: (error) => toast.error(errorMessage(error, "Error al eliminar")),
  });
}

export function usePurchases(supplyId: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, supplyId, "purchases"],
    queryFn: () => suppliesApi.purchases(supplyId as number),
    enabled: supplyId !== null,
  });
}

export function useAddPurchase(supplyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplyPurchaseInput) => suppliesApi.addPurchase(supplyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, supplyId, "purchases"] });
      toast.success("Compra registrada");
    },
    onError: (error) => toast.error(errorMessage(error, "Error al registrar la compra")),
  });
}

"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

export function usePurchases(supplyId: number, page: number, pageSize: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, supplyId, "purchases", page, pageSize],
    queryFn: () => suppliesApi.purchases(supplyId, (page - 1) * pageSize, pageSize),
    placeholderData: keepPreviousData,
  });
}

export function usePeriods(supplyId: number, page: number, pageSize: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, supplyId, "periods", page, pageSize],
    queryFn: () => suppliesApi.periods(supplyId, (page - 1) * pageSize, pageSize),
    placeholderData: keepPreviousData,
  });
}

export function useInfinitePeriods(supplyId: number, pageSize = 6) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEY, supplyId, "periods-infinite", pageSize],
    queryFn: ({ pageParam }) => suppliesApi.periods(supplyId, pageParam, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.pagination;
      return current_page < last_page ? current_page * pageSize : undefined;
    },
  });
}

export function usePurchase(supplyId: number, purchaseId?: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, supplyId, "purchase", purchaseId],
    queryFn: () => suppliesApi.purchase(supplyId, purchaseId as number),
    enabled: purchaseId != null,
  });
}

export function useReferencePurchase(supplyId: number, exclude?: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, supplyId, "reference", exclude ?? null],
    queryFn: () => suppliesApi.referencePurchase(supplyId, exclude),
  });
}

function invalidatePurchaseData(
  queryClient: ReturnType<typeof useQueryClient>,
  supplyId: number
) {
  // Invalida historial, períodos y referencia de este insumo
  queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, supplyId] });
}

export function useAddPurchase(supplyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplyPurchaseInput) => suppliesApi.addPurchase(supplyId, data),
    onSuccess: () => {
      invalidatePurchaseData(queryClient, supplyId);
      toast.success("Compra registrada");
    },
    onError: (error) => toast.error(errorMessage(error, "Error al registrar la compra")),
  });
}

export function useUpdatePurchase(supplyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ purchaseId, data }: { purchaseId: number; data: SupplyPurchaseInput }) =>
      suppliesApi.updatePurchase(supplyId, purchaseId, data),
    onSuccess: () => {
      invalidatePurchaseData(queryClient, supplyId);
      toast.success("Compra actualizada");
    },
    onError: (error) => toast.error(errorMessage(error, "Error al actualizar la compra")),
  });
}

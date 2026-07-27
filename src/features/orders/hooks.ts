"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { ordersApi } from "./api";
import type { CompleteOrderInput, OrderCreate, OrderFilters } from "./types";

const QUERY_KEY = ["orders"];

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function useOrders(filters: OrderFilters = {}, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters, page, pageSize],
    queryFn: () => ordersApi.list(filters, page, pageSize),
    placeholderData: keepPreviousData,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderCreate) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Pedido creado");
    },
    onError: (error) => toast.error(errorMessage(error, "Error al crear el pedido")),
  });
}

export function usePayOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      ordersApi.pay(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Pago registrado");
    },
    onError: (error) => toast.error(errorMessage(error, "Error al registrar el pago")),
  });
}

export function useCompleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompleteOrderInput }) =>
      ordersApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Pedido completado");
    },
    onError: (error) => toast.error(errorMessage(error, "Error al completar el pedido")),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Pedido cancelado");
    },
    onError: (error) => toast.error(errorMessage(error, "Error al cancelar el pedido")),
  });
}

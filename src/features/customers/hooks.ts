"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { customersApi } from "./api";
import type { CustomerInput } from "./types";

const QUERY_KEY = ["customers"];

export function useCustomers() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: customersApi.list });
}

export function useCustomersPaginated(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, "paginated", page, pageSize],
    queryFn: () => customersApi.listPaginated((page - 1) * pageSize, pageSize),
    placeholderData: keepPreviousData,
  });
}

export function useCustomerPrices(customerId: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, customerId, "prices"],
    queryFn: () => customersApi.prices(customerId as number),
    enabled: customerId !== null,
  });
}

export function useSetCustomerPrice(customerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, price }: { productId: number; price: number }) =>
      customersApi.setPrice(customerId, productId, price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, customerId, "prices"] });
      toast.success("Precio del cliente actualizado");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al guardar el precio"),
  });
}

export function useSaveCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: CustomerInput }) =>
      id ? customersApi.update(id, data) : customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Cliente guardado");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al guardar"),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Cliente eliminado");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al eliminar"),
  });
}

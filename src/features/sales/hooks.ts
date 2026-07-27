"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { salesApi } from "./api";
import type { SaleCreate, SaleFilters } from "./types";

const QUERY_KEY = ["sales"];

export function useSales(filters: SaleFilters = {}, page = 1, pageSize = 15) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters, page, pageSize],
    queryFn: () => salesApi.list(filters, page, pageSize),
    placeholderData: keepPreviousData,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaleCreate) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Venta registrada");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al registrar la venta"),
  });
}

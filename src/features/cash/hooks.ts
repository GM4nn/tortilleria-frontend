"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { cashApi } from "./api";
import type { CashCutCreate, CashFilters } from "./types";

export function useCashSummary() {
  return useQuery({ queryKey: ["cash", "summary"], queryFn: cashApi.summary });
}

export function useTodayCut() {
  return useQuery({ queryKey: ["cash", "today"], queryFn: cashApi.today });
}

export function useCashHistory(filters: CashFilters = {}, page = 1, pageSize = 15) {
  return useQuery({
    queryKey: ["cash", "history", filters, page, pageSize],
    queryFn: () => cashApi.list(filters, page, pageSize),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CashCutCreate) => cashApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash"] });
      toast.success("Corte de caja guardado");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error al guardar el corte"),
  });
}

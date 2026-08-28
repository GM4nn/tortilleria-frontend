"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { assistantApi } from "./api";

export function useAskAssistant() {
  return useMutation({
    mutationFn: (question: string) => assistantApi.ask(question),
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Error del asistente"),
  });
}

export function useKeyStatus() {
  return useQuery({
    queryKey: ["assistant", "key-status"],
    queryFn: assistantApi.getKeyStatus,
  });
}

export function useSetKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => assistantApi.setKey(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assistant", "key-status"] });
      toast.success("API key guardada");
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "No se pudo guardar la key"),
  });
}

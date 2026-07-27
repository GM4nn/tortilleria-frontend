"use client";

import { useMutation } from "@tanstack/react-query";
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

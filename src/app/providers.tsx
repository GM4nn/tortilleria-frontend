"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { makeQueryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/auth-context";
import { AuthGuard } from "@/features/auth/auth-guard";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>{children}</AuthGuard>
      </AuthProvider>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

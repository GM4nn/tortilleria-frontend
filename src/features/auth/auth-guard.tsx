"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "./auth-context";

// Protege las rutas: sin sesión -> login (/); con sesión en / -> /inicio
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLogin = pathname === "/";

  useEffect(() => {
    if (!ready) return;
    if (!user && !isLogin) router.replace("/");
    if (user && isLogin) router.replace("/sales/nueva");
  }, [ready, user, isLogin, router]);

  // Evita parpadeo: no renderiza contenido protegido sin sesión (ni el login con sesión)
  if (!ready) return null;
  if (!user && !isLogin) return null;
  if (user && isLogin) return null;

  return <>{children}</>;
}

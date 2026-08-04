"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthUser } from "./api";

const USER_KEY = "auth_user";
const TOKEN_KEY = "auth_token";

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean; // ya se leyó el almacenamiento
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (raw && token) setUser(JSON.parse(raw));
    } catch {
      /* almacenamiento no disponible */
    }
    setReady(true);
  }, []);

  const login = useCallback((u: AuthUser, token: string) => {
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    localStorage.setItem(TOKEN_KEY, token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

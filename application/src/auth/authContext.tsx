import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "../api/client";
import { saveTokens, clearTokens, getAccessToken } from "./tokenStorage";
import type { LoginResponse } from "@/types/api";

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Cold start: a stored access token doesn't mean it's still valid,
    // but apiFetch's 401->refresh handles that transparently on first
    // real request. This just decides whether to show the login screen.
    getAccessToken().then((token) => {
      setIsAuthenticated(!!token);
      setIsLoading(false);
    }).catch(err => {
      console.error("Failed to read token:", err);
      setIsAuthenticated(false);
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    });
    await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
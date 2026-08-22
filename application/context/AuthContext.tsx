import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import * as SecureStore from "expo-secure-store";
import { apiFetch, registerAuthHandlers } from "@/lib/api";

type User = { id: string; username: string; email: string };
type PendingVerification = { username: string; email: string; password: string };

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pendingVerification: PendingVerification | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  clearPendingVerification: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const ACCESS_KEY = "korasa_access_token";
const REFRESH_KEY = "korasa_refresh_token";
const USER_KEY = "korasa_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);

  // Not React state on purpose — always read/written straight to SecureStore
  // so there's no stale-closure risk between cold start, refresh, and logout.
  const refreshInFlight = useRef<Promise<string> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [token, storedUser] = await Promise.all([
          SecureStore.getItemAsync(ACCESS_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (token && storedUser) {
          setAccessToken(token);
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistSession = async (u: User, access: string, refresh: string) => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, access),
      SecureStore.setItemAsync(REFRESH_KEY, refresh),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(u)),
    ]);
    setUser(u);
    setAccessToken(access);
  };

  const logout = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setUser(null);
    setAccessToken(null);
  }, []);

  // Deduped: if three requests all get 401 within the same tick, they share
  // one in-flight /auth/refresh call instead of firing three.
  const performRefresh = useCallback(async (): Promise<string> => {
    if (refreshInFlight.current) return refreshInFlight.current;

    const doRefresh = async () => {
      const currentRefreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      if (!currentRefreshToken) {
        throw new Error("No refresh token available");
      }

      const data = await apiFetch("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
        skipAuthRetry: true,
      });

      if (!data.accessToken) {
        throw new Error("Refresh failed: unexpected response shape");
      }

      const nextRefreshToken = data.refreshToken ?? currentRefreshToken;
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_KEY, data.accessToken),
        SecureStore.setItemAsync(REFRESH_KEY, nextRefreshToken),
      ]);
      setAccessToken(data.accessToken);
      return data.accessToken as string;
    };

    const promise = doRefresh().finally(() => {
      refreshInFlight.current = null;
    });
    refreshInFlight.current = promise;
    return promise;
  }, []);

  // Wires the context-free apiFetch() helper up to this provider so any
  // hook's 401 gets refreshed-and-retried without every call site needing
  // to know refresh logic exists.
  useEffect(() => {
    registerAuthHandlers(performRefresh, () => {
      logout();
    });
  }, [performRefresh, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!data.accessToken || !data.user) {
      throw new Error("Login failed: unexpected response shape");
    }
    await persistSession(data.user, data.accessToken, data.refreshToken);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    setPendingVerification({ username, email, password });
  }, []);

  const verifyEmail = useCallback(
    async (code: string) => {
      if (!pendingVerification) {
        throw new Error("No pending verification. Please register again.");
      }
      await apiFetch("/auth/verify", {
        method: "POST",
        body: JSON.stringify({ email: pendingVerification.email, code }),
      });
      await login(pendingVerification.email, pendingVerification.password);
      setPendingVerification(null);
    },
    [pendingVerification, login],
  );

  const resendVerification = useCallback(async () => {
    if (!pendingVerification) {
      throw new Error("No pending verification. Please register again.");
    }
    await apiFetch("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email: pendingVerification.email }),
    });
  }, [pendingVerification]);

  const clearPendingVerification = useCallback(() => {
    setPendingVerification(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!accessToken,
        pendingVerification,
        login,
        register,
        verifyEmail,
        resendVerification,
        clearPendingVerification,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
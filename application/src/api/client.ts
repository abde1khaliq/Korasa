import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "@/auth/tokenStorage";

// EXPO_PUBLIC_ prefix required for Expo to inline this at build time.
// Resolved lazily so a missing env var doesn't crash the app at import time.
function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (!url) {
    throw new Error("EXPO_PUBLIC_BACKEND_URL is not set — check your .env / app config");
  }
  return url;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Prevents N concurrent 401s from firing N parallel refresh calls,
// which would race and likely invalidate each other's refresh token.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${getBaseUrl()}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        await clearTokens();
        return null;
      }
      const data = await res.json();
      await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return data.accessToken as string;
    } catch {
      await clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  const doFetch = async (token: string | null) => {
    return fetch(`${getBaseUrl()}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  };

  let token = skipAuth ? null : await getAccessToken();
  let res = await doFetch(token);

  // Access token expired mid-session — refresh once and retry.
  if (res.status === 401 && !skipAuth) {
    token = await refreshAccessToken();
    if (!token) {
      throw new ApiError(401, "Session expired");
    }
    res = await doFetch(token);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
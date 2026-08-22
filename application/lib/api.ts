const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ApiOptions = RequestInit & { token?: string; skipAuthRetry?: boolean };

// Registered by AuthContext on mount. api.ts has no React context access,
// so this is how a 401 in a plain fetch helper gets routed back to the
// provider that actually owns the refresh token.
type RefreshHandler = () => Promise<string>;
let refreshHandler: RefreshHandler | null = null;
let onRefreshFailed: (() => void) | null = null;

export function registerAuthHandlers(refresh: RefreshHandler, onFail: () => void) {
  refreshHandler = refresh;
  onRefreshFailed = onFail;
}

async function doFetch(path: string, options: ApiOptions) {
  const { token, headers, skipAuthRetry, ...rest } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  }

  return data;
}

export async function apiFetch(path: string, options: ApiOptions = {}) {
  try {
    return await doFetch(path, options);
  } catch (err) {
    const isAuthError = err instanceof ApiError && err.status === 401;

    // Only attempt refresh for authenticated requests that haven't already
    // been retried once (skipAuthRetry prevents infinite recursion when the
    // refresh call itself, or the retried request, also comes back 401).
    if (isAuthError && options.token && !options.skipAuthRetry && refreshHandler) {
      try {
        const newToken = await refreshHandler();
        return await doFetch(path, { ...options, token: newToken, skipAuthRetry: true });
      } catch {
        onRefreshFailed?.();
        throw err; // surface the original 401, not the refresh's internal error
      }
    }

    throw err;
  }
}
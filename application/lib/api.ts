const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ApiOptions = RequestInit & { token?: string; skipAuthRetry?: boolean };
type RefreshHandler = () => Promise<string>;
let refreshHandler: RefreshHandler | null = null;
let onRefreshFailed: (() => void) | null = null;

export function registerAuthHandlers(refresh: RefreshHandler, onFail: () => void) {
  refreshHandler = refresh;
  onRefreshFailed = onFail;
}

async function doFetch(path: string, options: ApiOptions) {
  const { token, headers, skipAuthRetry, ...rest } = options;
  const isFormData = rest.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

    if (isAuthError && options.token && !options.skipAuthRetry && refreshHandler) {
      try {
        const newToken = await refreshHandler();
        return await doFetch(path, { ...options, token: newToken, skipAuthRetry: true });
      } catch {
        onRefreshFailed?.();
        throw err;
      }
    }

    throw err;
  }
}
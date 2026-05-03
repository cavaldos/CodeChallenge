import { clearAuthCookies, getAccessToken, getRefreshToken, persistAuthTokens } from './cookies';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface ApiError {
  error?: string;
  message?: string;
}

interface TokenResponse {
  success?: boolean;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

let isRefreshingToken = false;
let refreshPromise: Promise<boolean> | null = null;

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
};

const resolveErrorMessage = async (response: Response): Promise<string> => {
  try {
    const parsed = (await response.json()) as ApiError;
    return parsed.message || parsed.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

const attemptRefreshToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthCookies();
    return false;
  }

  if (isRefreshingToken && refreshPromise) {
    return refreshPromise;
  }

  isRefreshingToken = true;
  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) {
        clearAuthCookies();
        return false;
      }

      const payload = (await response.json()) as TokenResponse;
      if (!payload.tokens?.accessToken || !payload.tokens?.refreshToken) {
        clearAuthCookies();
        return false;
      }

      persistAuthTokens(payload.tokens);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      isRefreshingToken = false;
      refreshPromise = null;
    });

  return refreshPromise;
};

const request = async <T>(url: string, method: HttpMethod, data?: unknown, retry = true): Promise<T> => {
  const accessToken = getAccessToken();
  const headers: HeadersInit = {
    ...defaultHeaders,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  const isAuthRefreshEndpoint = url === '/auth/refresh';
  const isAuthLoginEndpoint = url === '/auth/login';
  const isAuthRegisterEndpoint = url === '/auth/register';
  const isAuthMeEndpoint = url === '/auth/me';

  const shouldAttemptRefresh =
    response.status === 401 &&
    retry &&
    !isAuthRefreshEndpoint &&
    !isAuthLoginEndpoint &&
    !isAuthRegisterEndpoint &&
    !isAuthMeEndpoint;

  if (shouldAttemptRefresh) {
    const refreshed = await attemptRefreshToken();
    if (refreshed) {
      return request<T>(url, method, data, false);
    }
  }

  if (!response.ok) {
    const errorMessage = await resolveErrorMessage(response);
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const fetcher = async <T>(url: string): Promise<T> => request<T>(url, 'GET');

export const postFetcher = async <T>(url: string, data?: unknown): Promise<T> => request<T>(url, 'POST', data);

export const patchFetcher = async <T>(url: string, data?: unknown): Promise<T> => request<T>(url, 'PATCH', data);

export const deleteFetcher = async <T>(url: string): Promise<T> => request<T>(url, 'DELETE');

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface ApiError {
  error?: string;
  message?: string;
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
  if (isRefreshingToken && refreshPromise) {
    return refreshPromise;
  }

  isRefreshingToken = true;
  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: defaultHeaders,
    credentials: 'include',
  })
    .then(response => response.ok)
    .catch(() => false)
    .finally(() => {
      isRefreshingToken = false;
      refreshPromise = null;
    });

  return refreshPromise;
};

const request = async <T>(url: string, method: HttpMethod, data?: unknown, retry = true): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: defaultHeaders,
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  });

  const isAuthRefreshEndpoint = url === '/auth/refresh';
  const isAuthLoginEndpoint = url === '/auth/login';
  const isAuthRegisterEndpoint = url === '/auth/register';

  if (response.status === 401 && retry && !isAuthRefreshEndpoint && !isAuthLoginEndpoint && !isAuthRegisterEndpoint) {
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

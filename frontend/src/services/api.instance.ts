const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Store JWT token in memory
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const initAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }
  return token;
};

export const getAuthToken = () => authToken;

// SWR fetcher with JWT auth
export const fetcher = async <T>(url: string): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const error = new Error('Request failed');
    throw error;
  }

  return res.json() as Promise<T>;
};

// POST fetcher for creating/updating data
export const postFetcher = async <T>(url: string, data?: unknown): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const error = new Error('Request failed');
    throw error;
  }

  return res.json() as Promise<T>;
};

// PATCH fetcher
export const patchFetcher = async <T>(url: string, data?: unknown): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: 'PATCH',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const error = new Error('Request failed');
    throw error;
  }

  return res.json() as Promise<T>;
};

// DELETE fetcher
export const deleteFetcher = async <T>(url: string): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const error = new Error('Request failed');
    throw error;
  }

  return res.json() as Promise<T>;
};

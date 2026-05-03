import useSWR from 'swr';
import { postFetcher, fetcher as baseFetcher } from './api.instance';
import { getRefreshToken, persistAuthTokens } from './cookies';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Auth functions (non-SWR for login/register)
export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface RefreshResponse {
  success: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = new Error('Registration failed');
    throw error;
  }

  const response: RegisterResponse = await res.json();
  return response;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = new Error('Login failed');
    throw error;
  }

  const response: AuthResponse = await res.json();
  persistAuthTokens(response.tokens);
  return response;
};

export const refreshAccessToken = async (): Promise<RefreshResponse> => {
  return postFetcher<RefreshResponse>('/auth/refresh', {
    refreshToken: getRefreshToken() ?? undefined,
  });
};

export const logout = async (): Promise<void> => {
  await postFetcher<{ success: boolean }>('/auth/logout', {
    refreshToken: getRefreshToken() ?? undefined,
  });
};

// Current user hook
export const useCurrentUser = () => {
  return useSWR<User>('/auth/me', baseFetcher);
};

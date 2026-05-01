import useSWR from 'swr';
import { postFetcher, setAuthToken, fetcher as baseFetcher } from './api.instance';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
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
  accessToken: string;
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
  setAuthToken(response.accessToken);
  return response;
};

export const refreshAccessToken = async (refreshToken: string): Promise<RefreshResponse> => {
  return postFetcher<RefreshResponse>('/auth/refresh', { refreshToken });
};

export const logout = () => {
  setAuthToken(null);
};

// Current user hook
export const useCurrentUser = () => {
  return useSWR<User>('/auth/me', baseFetcher);
};

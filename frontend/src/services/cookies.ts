/**
 * Cookie utility for managing tokens in browser storage
 */

const ACCESS_TOKEN_COOKIE_NAME = 'access_token';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function parseCookies(): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (typeof document === 'undefined' || !document.cookie) {
    return cookies;
  }

  document.cookie.split(';').forEach((cookie) => {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name) {
      cookies[name] = valueParts.join('=');
    }
  });

  return cookies;
}

function setCookie(name: string, value: string, maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  const cookies = parseCookies();
  return cookies[name] || null;
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_COOKIE_NAME);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_COOKIE_NAME);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function clearAuthCookies(): void {
  clearCookie(ACCESS_TOKEN_COOKIE_NAME);
  clearCookie(REFRESH_TOKEN_COOKIE_NAME);
}

export function setAccessToken(token: string): void {
  setCookie(ACCESS_TOKEN_COOKIE_NAME, token);
}

export function setRefreshToken(token: string): void {
  setCookie(REFRESH_TOKEN_COOKIE_NAME, token);
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function persistAuthTokens(tokens: AuthTokens): void {
  setAccessToken(tokens.accessToken);
  setRefreshToken(tokens.refreshToken);
}

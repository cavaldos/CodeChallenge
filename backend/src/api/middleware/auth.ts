import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
const PASSWORD_SECRET = process.env.PASSWORD_SECRET || 'password-secret';

export const ACCESS_TOKEN_COOKIE_NAME = 'access_token';
export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

const isProduction = process.env.NODE_ENV === 'production';
const cookieSameSite: 'lax' | 'none' = isProduction ? 'none' : 'lax';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: cookieSameSite,
  path: '/',
} as const;

function parseDurationToMilliseconds(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 15 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const unitToMilliseconds: Record<'s' | 'm' | 'h' | 'd', number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitToMilliseconds[unit as 's' | 'm' | 'h' | 'd'];
}

function getCookieValue(cookieHeader: string | undefined, cookieName: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(';')
    .map(item => item.trim())
    .find(item => item.startsWith(`${cookieName}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(cookieName.length + 1);
  return value ? decodeURIComponent(value) : null;
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: parseDurationToMilliseconds(JWT_EXPIRES_IN),
  });

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: parseDurationToMilliseconds(REFRESH_TOKEN_EXPIRES_IN),
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, COOKIE_OPTIONS);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, COOKIE_OPTIONS);
}

export function getRefreshTokenFromRequest(req: Request): string | null {
  return getCookieValue(req.header('cookie'), REFRESH_TOKEN_COOKIE_NAME);
}

function getAccessTokenFromRequest(req: Request): string | null {
  const authorizationHeader = req.header('Authorization');

  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    return authorizationHeader.replace('Bearer ', '').trim();
  }

  return getCookieValue(req.header('cookie'), ACCESS_TOKEN_COOKIE_NAME);
}

export function verifyAccessToken(token: string): AuthTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

type JwtExpiry = `${number}${'s' | 'm' | 'h' | 'd'}`;

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload extends AuthTokenPayload {
  tokenId: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthTokenPayload;
}

export function hashPassword(password: string): string {
  return createHmac('sha256', PASSWORD_SECRET).update(password).digest('hex');
}

export function comparePassword(password: string, passwordHash: string): boolean {
  const computedHash = hashPassword(password);
  const computedBuffer = Buffer.from(computedHash);
  const storedBuffer = Buffer.from(passwordHash);

  if (computedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(computedBuffer, storedBuffer);
}

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as JwtExpiry,
  });
}

export function createRefreshTokenId(): string {
  return randomUUID();
}

export function hashRefreshToken(token: string): string {
  return createHmac('sha256', REFRESH_TOKEN_SECRET).update(token).digest('hex');
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as JwtExpiry,
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;

    if (!payload.tokenId) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      tokenId: payload.tokenId,
    };
  } catch {
    return null;
  }
}

export function getRefreshTokenExpiryDate(token: string): Date | null {
  const decoded = jwt.decode(token) as JwtPayload | null;

  if (!decoded || typeof decoded.exp !== 'number') {
    return null;
  }

  return new Date(decoded.exp * 1000);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = getAccessTokenFromRequest(req);

  if (!token) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization token',
    });
    return;
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token is invalid or expired',
    });
    return;
  }

  (req as AuthenticatedRequest).user = payload;
  next();
}

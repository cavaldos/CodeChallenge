import { createHmac, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
const PASSWORD_SECRET = process.env.PASSWORD_SECRET || 'password-secret';

type JwtExpiry = `${number}${'s' | 'm' | 'h' | 'd'}`;

export interface AuthTokenPayload {
  userId: string;
  email: string;
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

export function signRefreshToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as JwtExpiry,
  });
}

export function verifyRefreshToken(token: string): AuthTokenPayload | null {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as AuthTokenPayload;
    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authorizationHeader = req.header('Authorization');

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization token',
    });
    return;
  }

  const token = authorizationHeader.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    (req as AuthenticatedRequest).user = {
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token is invalid or expired',
    });
  }
}

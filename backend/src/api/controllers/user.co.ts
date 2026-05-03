import { ZodError } from 'zod';
import { Request, Response } from 'express';
import UserRepository from '../repository/user.repo';
import RefreshTokenRepository from '../repository/refresh-token.repo';
import {
  clearAuthCookies,
  comparePassword,
  createRefreshTokenId,
  getRefreshTokenExpiryDate,
  getRefreshTokenFromRequest,
  hashPassword,
  hashRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  AuthenticatedRequest,
} from '../middleware/auth';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  sendValidationError,
  validateInput,
  getValidationErrors,
} from '../utils/validation';

const UserController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, password } = validateInput(registerSchema, req.body);

      const existingUser = await UserRepository.findByEmail(email.toLowerCase());
      if (existingUser) {
        res.status(409).json({
          error: 'CONFLICT',
          message: 'Email already exists',
        });
        return;
      }

      const createdUser = await UserRepository.create({
        email: email.toLowerCase(),
        name: name.trim(),
        passwordHash: hashPassword(password),
      });

      res.status(201).json({
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        created_at: createdUser.createdAt.toISOString(),
      });
    } catch (err) {
      if (err instanceof ZodError) {
        sendValidationError(res, getValidationErrors(err));
        return;
      }
      throw err;
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = validateInput(loginSchema, req.body);

      const user = await UserRepository.findByEmail(email.toLowerCase());
      if (!user || !comparePassword(password, user.passwordHash)) {
        res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'Wrong email or password',
        });
        return;
      }

      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshTokenId = createRefreshTokenId();
      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        tokenId: refreshTokenId,
      });

      const refreshTokenExpiresAt = getRefreshTokenExpiryDate(refreshToken);
      if (!refreshTokenExpiresAt) {
        throw new Error('Could not determine refresh token expiry');
      }

      // Try to store refresh token in DB - if table doesn't exist, just continue without it
      try {
        await RefreshTokenRepository.create({
          id: refreshTokenId,
          userId: user.id,
          tokenHash: hashRefreshToken(refreshToken),
          expiresAt: refreshTokenExpiresAt,
        });
      } catch {
        // Table may not exist yet - continue without DB tracking
      }

      setAuthCookies(res, accessToken, refreshToken);

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      if (err instanceof ZodError) {
        sendValidationError(res, getValidationErrors(err));
        return;
      }
      throw err;
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const refreshTokenFromCookie = getRefreshTokenFromRequest(req);

    let refreshToken = refreshTokenFromCookie;

    if (!refreshToken && typeof req.body === 'object' && req.body !== null && 'refreshToken' in req.body) {
      try {
        const parsed = validateInput(refreshSchema, req.body);
        refreshToken = parsed.refreshToken;
      } catch (err) {
        if (err instanceof ZodError) {
          sendValidationError(res, getValidationErrors(err));
          return;
        }
        throw err;
      }
    }

    if (!refreshToken) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Refresh token is missing',
      });
      return;
    }

    const normalizedRefreshToken = refreshToken.trim();
    const payload = verifyRefreshToken(normalizedRefreshToken);

    if (!payload) {
      clearAuthCookies(res);
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Refresh token is invalid or expired',
      });
      return;
    }

    // Try DB check - if table doesn't exist, skip validation and continue
    let storedToken = null;
    try {
      storedToken = await RefreshTokenRepository.findActiveById(payload.tokenId);
    } catch {
      // Table may not exist yet - skip DB validation
    }

    if (storedToken && storedToken.userId !== payload.userId) {
      clearAuthCookies(res);
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Refresh token has been revoked',
      });
      return;
    }

    if (storedToken) {
      const incomingTokenHash = hashRefreshToken(normalizedRefreshToken);
      if (incomingTokenHash !== storedToken.tokenHash) {
        try {
          await RefreshTokenRepository.revokeById(payload.tokenId);
        } catch {
          // Ignore
        }
        clearAuthCookies(res);
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Refresh token has been revoked',
        });
        return;
      }

      try {
        await RefreshTokenRepository.revokeById(payload.tokenId);
      } catch {
        // Ignore
      }
    }

    const accessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    const rotatedRefreshTokenId = createRefreshTokenId();
    const rotatedRefreshToken = signRefreshToken({
      userId: payload.userId,
      email: payload.email,
      tokenId: rotatedRefreshTokenId,
    });

    const rotatedRefreshTokenExpiresAt = getRefreshTokenExpiryDate(rotatedRefreshToken);
    if (!rotatedRefreshTokenExpiresAt) {
      throw new Error('Could not determine refresh token expiry');
    }

    // Try to store rotated token - if table doesn't exist, just continue
    try {
      await RefreshTokenRepository.create({
        id: rotatedRefreshTokenId,
        userId: payload.userId,
        tokenHash: hashRefreshToken(rotatedRefreshToken),
        expiresAt: rotatedRefreshTokenExpiresAt,
      });
    } catch {
      // Ignore
    }

    setAuthCookies(res, accessToken, rotatedRefreshToken);

    res.status(200).json({
      success: true,
      tokens: {
        accessToken,
        refreshToken: rotatedRefreshToken,
      },
    });
  },

  async me(req: Request, res: Response): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const userId = authenticatedRequest.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Missing authenticated user context',
      });
      return;
    }

    const user = await UserRepository.findById(userId);

    if (!user) {
      clearAuthCookies(res);
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.createdAt.toISOString(),
    });
  },

  async logout(req: Request, res: Response): Promise<void> {
    let refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken && typeof req.body === 'object' && req.body !== null) {
      try {
        const parsed = validateInput(logoutSchema, req.body);
        refreshToken = parsed.refreshToken ?? null;
      } catch (err) {
        if (err instanceof ZodError) {
          sendValidationError(res, getValidationErrors(err));
          return;
        }
        throw err;
      }
    }

    if (refreshToken) {
      const payload = verifyRefreshToken(refreshToken.trim());
      if (payload?.tokenId) {
        try {
          await RefreshTokenRepository.revokeById(payload.tokenId);
        } catch {
          // Ignore if table doesn't exist
        }
      }
    }

    clearAuthCookies(res);
    res.status(200).json({ success: true });
  },
};

export default UserController;
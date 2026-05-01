import { ZodError } from 'zod';
import { Request, Response } from 'express';
import UserRepository from '../repository/user.repo';
import {
  clearAuthCookies,
  comparePassword,
  getRefreshTokenFromRequest,
  hashPassword,
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

      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
      });

      setAuthCookies(res, accessToken, refreshToken);

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
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

    const payload = verifyRefreshToken(refreshToken.trim());
    if (!payload) {
      clearAuthCookies(res);
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Refresh token is invalid or expired',
      });
      return;
    }

    const accessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    const rotatedRefreshToken = signRefreshToken({
      userId: payload.userId,
      email: payload.email,
    });

    setAuthCookies(res, accessToken, rotatedRefreshToken);

    res.status(200).json({
      success: true,
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

  async logout(_req: Request, res: Response): Promise<void> {
    clearAuthCookies(res);
    res.status(200).json({ success: true });
  },
};

export default UserController;
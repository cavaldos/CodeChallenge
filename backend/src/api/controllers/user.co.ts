import { ZodError } from 'zod';
import { Request, Response } from 'express';
import UserRepository from '../repository/user.repo';
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
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

      res.status(200).json({
        accessToken,
        refreshToken,
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
    try {
      const { refreshToken } = validateInput(refreshSchema, req.body);

      const payload = verifyRefreshToken(refreshToken.trim());
      if (!payload) {
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

      res.status(200).json({
        accessToken,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        sendValidationError(res, getValidationErrors(err));
        return;
      }
      throw err;
    }
  },
};

export default UserController;
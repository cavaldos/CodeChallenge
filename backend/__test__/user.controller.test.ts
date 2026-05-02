import { Response } from 'express';
import UserController from '../src/api/controllers/user.co';
import UserRepository, { UserEntity } from '../src/api/repository/user.repo';
import * as authModule from '../src/api/middleware/auth';
import { AuthenticatedRequest } from '../src/api/middleware/auth';

function createResponseMock(): Response {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;

  (response.status as unknown as jest.Mock).mockReturnValue(response);
  (response.json as unknown as jest.Mock).mockReturnValue(response);

  return response;
}

function createUser(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    id: '06a95f7f-f0f4-4331-8bd9-e4a39af95c06',
    email: 'user@example.com',
    name: 'John Doe',
    passwordHash: 'hashed-password',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('UserController', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('register returns conflict when email already exists', async () => {
    jest.spyOn(UserRepository, 'findByEmail').mockResolvedValue(createUser());
    const createSpy = jest.spyOn(UserRepository, 'create');

    const request = {
      body: {
        email: 'USER@example.com',
        name: 'User Name',
        password: 'secret123',
      },
    } as AuthenticatedRequest;
    const response = createResponseMock();

    await UserController.register(request, response);

    expect(createSpy).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      error: 'CONFLICT',
      message: 'Email already exists',
    });
  });

  it('login returns unauthorized when password is wrong', async () => {
    jest.spyOn(UserRepository, 'findByEmail').mockResolvedValue(createUser());
    jest.spyOn(authModule, 'comparePassword').mockReturnValue(false);

    const request = {
      body: {
        email: 'user@example.com',
        password: 'wrong-password',
      },
    } as AuthenticatedRequest;
    const response = createResponseMock();

    await UserController.login(request, response);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      error: 'INVALID_CREDENTIALS',
      message: 'Wrong email or password',
    });
  });

  it('me returns unauthorized when authenticated context is missing', async () => {
    const request = {
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const response = createResponseMock();

    await UserController.me(request, response);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      error: 'UNAUTHORIZED',
      message: 'Missing authenticated user context',
    });
  });
});

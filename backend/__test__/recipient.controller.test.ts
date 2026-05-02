import { Request, Response } from 'express';
import RecipientController from '../src/api/controllers/recipient.co';
import RecipientRepository, { RecipientEntity } from '../src/api/repository/recipient.repo';

function createResponseMock(): Response {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;

  (response.status as unknown as jest.Mock).mockReturnValue(response);
  (response.json as unknown as jest.Mock).mockReturnValue(response);

  return response;
}

function createRecipient(overrides: Partial<RecipientEntity> = {}): RecipientEntity {
  return {
    id: 'f8f0bd13-2de7-42f2-b751-f705f38db8fd',
    email: 'recipient@example.com',
    name: 'Recipient Name',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('RecipientController', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('list uses campaign filter when campaignId is provided', async () => {
    const findByCampaignIdSpy = jest
      .spyOn(RecipientRepository, 'findByCampaignId')
      .mockResolvedValue([createRecipient()]);
    const findAllSpy = jest.spyOn(RecipientRepository, 'findAll');

    const request = {
      query: {
        campaignId: '9ea9ed25-22ec-464a-b717-4af1f89e7f04',
      },
    } as unknown as Request;
    const response = createResponseMock();

    await RecipientController.list(request, response);

    expect(findByCampaignIdSpy).toHaveBeenCalledWith('9ea9ed25-22ec-464a-b717-4af1f89e7f04');
    expect(findAllSpy).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('create returns conflict when recipient email already exists', async () => {
    jest.spyOn(RecipientRepository, 'findByEmail').mockResolvedValue(createRecipient());
    const createSpy = jest.spyOn(RecipientRepository, 'create');

    const request = {
      body: {
        email: 'RECIPIENT@example.com',
        name: 'Recipient Name',
      },
    } as unknown as Request;
    const response = createResponseMock();

    await RecipientController.create(request, response);

    expect(createSpy).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      error: 'CONFLICT',
      message: 'Recipient email already exists',
    });
  });

  it('create normalizes email before saving', async () => {
    jest.spyOn(RecipientRepository, 'findByEmail').mockResolvedValue(null);
    const createSpy = jest.spyOn(RecipientRepository, 'create').mockResolvedValue(
      createRecipient({
        email: 'recipient@example.com',
        name: 'Recipient Name',
      }),
    );

    const request = {
      body: {
        email: 'RECIPIENT@EXAMPLE.COM',
        name: '  Recipient Name  ',
      },
    } as unknown as Request;
    const response = createResponseMock();

    await RecipientController.create(request, response);

    expect(createSpy).toHaveBeenCalledWith({
      email: 'recipient@example.com',
      name: 'Recipient Name',
    });
    expect(response.status).toHaveBeenCalledWith(201);
  });
});

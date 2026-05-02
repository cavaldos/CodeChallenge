import { Response } from 'express';
import CampaignController from '../src/api/controllers/campaign.co';
import CampaignRepository, {
  CampaignDetail,
  CampaignEntity,
} from '../src/api/repository/campaign.repo';
import { AuthenticatedRequest } from '../src/api/middleware/auth';

const USER_ID = 'a8f2d1a3-58f6-4471-85be-3f4ad516d0a1';
const CAMPAIGN_ID = 'e6d5d952-5f29-4cc2-b6e5-5bbbf0b4dd4f';

function createResponseMock(): Response {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;

  (response.status as unknown as jest.Mock).mockReturnValue(response);
  (response.json as unknown as jest.Mock).mockReturnValue(response);

  return response;
}

function createAuthenticatedRequest(body: unknown = {}): AuthenticatedRequest {
  return {
    params: { id: CAMPAIGN_ID },
    body,
    user: {
      userId: USER_ID,
      email: 'owner@example.com',
    },
  } as unknown as AuthenticatedRequest;
}

function createCampaign(overrides: Partial<CampaignEntity> = {}): CampaignEntity {
  return {
    id: CAMPAIGN_ID,
    name: 'Monthly Promo',
    subject: 'Hello',
    body: 'Campaign body',
    status: 'draft',
    scheduledAt: null,
    createdBy: USER_ID,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function createCampaignDetail(): CampaignDetail {
  return {
    ...createCampaign({ status: 'sent' }),
    stats: {
      total: 2,
      sent: 2,
      failed: 0,
      opened: 1,
      openRate: 0.5,
      sendRate: 1,
    },
    recipients: [],
  };
}

describe('CampaignController business rules', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not allow editing campaign when status is not draft', async () => {
    const findByIdSpy = jest
      .spyOn(CampaignRepository, 'findById')
      .mockResolvedValue(createCampaign({ status: 'scheduled' }));
    const updateDraftByIdSpy = jest.spyOn(CampaignRepository, 'updateDraftById');

    const request = createAuthenticatedRequest({ name: 'Updated name' });
    const response = createResponseMock();

    await CampaignController.update(request, response);

    expect(findByIdSpy).toHaveBeenCalledWith(CAMPAIGN_ID);
    expect(updateDraftByIdSpy).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.json).toHaveBeenCalledWith({
      error: 'CAMPAIGN_NOT_DRAFT',
      message: 'Campaign can only be edited when status is draft',
    });
  });

  it('rejects schedule when scheduled time is in the past', async () => {
    const pastDateIso = new Date(Date.now() - 60_000).toISOString();

    const findByIdSpy = jest.spyOn(CampaignRepository, 'findById').mockResolvedValue(createCampaign());
    const scheduleByIdSpy = jest.spyOn(CampaignRepository, 'scheduleById');

    const request = createAuthenticatedRequest({ scheduledAt: pastDateIso });
    const response = createResponseMock();

    await CampaignController.schedule(request, response);

    expect(findByIdSpy).toHaveBeenCalledWith(CAMPAIGN_ID);
    expect(scheduleByIdSpy).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.json).toHaveBeenCalledWith({
      error: 'SCHEDULED_AT_PAST',
      message: 'scheduled_at must be in the future',
    });
  });

  it('sends campaign and runs status transition in correct order', async () => {
    jest.spyOn(CampaignRepository, 'findById').mockResolvedValue(createCampaign());
    jest.spyOn(CampaignRepository, 'countRecipients').mockResolvedValue(2);

    const markAsSendingSpy = jest.spyOn(CampaignRepository, 'markAsSending').mockResolvedValue(null);
    const simulateSendSpy = jest.spyOn(CampaignRepository, 'simulateSend').mockResolvedValue();
    const completeSendSpy = jest.spyOn(CampaignRepository, 'completeSend').mockResolvedValue(null);

    jest.spyOn(CampaignRepository, 'getDetailById').mockResolvedValue(createCampaignDetail());

    const request = createAuthenticatedRequest();
    const response = createResponseMock();

    await CampaignController.send(request, response);

    expect(markAsSendingSpy).toHaveBeenCalledWith(CAMPAIGN_ID);
    expect(simulateSendSpy).toHaveBeenCalledWith(CAMPAIGN_ID);
    expect(completeSendSpy).toHaveBeenCalledWith(CAMPAIGN_ID);

    const markOrder = markAsSendingSpy.mock.invocationCallOrder[0];
    const simulateOrder = simulateSendSpy.mock.invocationCallOrder[0];
    const completeOrder = completeSendSpy.mock.invocationCallOrder[0];

    expect(markOrder).toBeLessThan(simulateOrder);
    expect(simulateOrder).toBeLessThan(completeOrder);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Campaign sent successfully',
      stats: {
        total: 2,
        sent: 2,
        failed: 0,
        opened: 1,
        open_rate: 0.5,
        send_rate: 1,
      },
    });
  });

  it('does not allow sending campaign that is already sent', async () => {
    const findByIdSpy = jest
      .spyOn(CampaignRepository, 'findById')
      .mockResolvedValue(createCampaign({ status: 'sent' }));
    const countRecipientsSpy = jest.spyOn(CampaignRepository, 'countRecipients');

    const request = createAuthenticatedRequest();
    const response = createResponseMock();

    await CampaignController.send(request, response);

    expect(findByIdSpy).toHaveBeenCalledWith(CAMPAIGN_ID);
    expect(countRecipientsSpy).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.json).toHaveBeenCalledWith({
      error: 'CAMPAIGN_ALREADY_SENT',
      message: 'Campaign already sent',
    });
  });

  it('rejects send campaign when there are no recipients', async () => {
    jest.spyOn(CampaignRepository, 'findById').mockResolvedValue(createCampaign());
    const countRecipientsSpy = jest.spyOn(CampaignRepository, 'countRecipients').mockResolvedValue(0);
    const markAsSendingSpy = jest.spyOn(CampaignRepository, 'markAsSending');

    const request = createAuthenticatedRequest();
    const response = createResponseMock();

    await CampaignController.send(request, response);

    expect(countRecipientsSpy).toHaveBeenCalledWith(CAMPAIGN_ID);
    expect(markAsSendingSpy).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.json).toHaveBeenCalledWith({
      error: 'NO_RECIPIENTS',
      message: 'Campaign has no recipients',
    });
  });
});

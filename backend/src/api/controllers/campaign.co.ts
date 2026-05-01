import { ZodError } from 'zod';
import { Request, Response } from 'express';
import sequelize from '../../database/connection';
import CampaignRepository, { CampaignStatus } from '../repository/campaign.repo';
import RecipientRepository from '../repository/recipient.repo';
import { AuthenticatedRequest } from '../middleware/auth';
import { toIsoOrNull } from '../utils/format';
import {
  campaignCreateSchema,
  campaignUpdateSchema,
  campaignScheduleSchema,
  sendValidationError,
  validateInput,
  getValidationErrors,
} from '../utils/validation';

function mapCampaignSummary(campaign: Awaited<ReturnType<typeof CampaignRepository.findAllByUser>>[number]) {
  return {
    id: campaign.id,
    name: campaign.name,
    subject: campaign.subject,
    status: campaign.status,
    scheduled_at: toIsoOrNull(campaign.scheduledAt),
    created_at: campaign.createdAt.toISOString(),
    stats: {
      total: campaign.stats.total,
      sent: campaign.stats.sent,
      failed: campaign.stats.failed,
      opened: campaign.stats.opened,
    },
  };
}

const allowedStatuses: CampaignStatus[] = ['draft', 'sending', 'scheduled', 'sent'];

const CampaignController = {
  async list(req: Request, res: Response): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const statusQuery = req.query.status;

    let status: CampaignStatus | undefined;
    if (typeof statusQuery === 'string') {
      if (!allowedStatuses.includes(statusQuery as CampaignStatus)) {
        sendValidationError(res, 'status is invalid');
        return;
      }
      status = statusQuery as CampaignStatus;
    }

    const campaigns = await CampaignRepository.findAllByUser(authenticatedRequest.user.userId, status);

    res.status(200).json({
      data: campaigns.map(mapCampaignSummary),
      pagination: {
        page: 1,
        limit: campaigns.length,
        total: campaigns.length,
      },
    });
  },

  async create(req: Request, res: Response): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;

    try {
      const { name, subject, body, recipient_ids: recipientIds = [] } = validateInput(campaignCreateSchema, req.body);

      if (recipientIds.length > 0) {
        const recipients = await RecipientRepository.findByIds(recipientIds);
        if (recipients.length !== recipientIds.length) {
          res.status(404).json({
            error: 'RECIPIENT_NOT_FOUND',
            message: 'One or more recipient_ids were not found',
          });
          return;
        }
      }

      const campaign = await sequelize.transaction(async (transaction) => {
        const createdCampaign = await CampaignRepository.create(
          {
            name: name.trim(),
            subject: subject.trim(),
            body: body.trim(),
            createdBy: authenticatedRequest.user.userId,
          },
          transaction,
        );

        await CampaignRepository.attachRecipients(createdCampaign.id, recipientIds, transaction);
        return createdCampaign;
      });

      res.status(201).json({
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        scheduled_at: toIsoOrNull(campaign.scheduledAt),
        created_at: campaign.createdAt.toISOString(),
      });
    } catch (err) {
      if (err instanceof ZodError) {
        sendValidationError(res, getValidationErrors(err));
        return;
      }
      throw err;
    }
  },

  async detail(req: Request, res: Response): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const campaignId = req.params.id;

    const campaign = await CampaignRepository.getDetailById(campaignId);
    if (!campaign) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Campaign not found',
      });
      return;
    }

    if (campaign.createdBy !== authenticatedRequest.user.userId) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not have access to this campaign',
      });
      return;
    }

    res.status(200).json({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      body: campaign.body,
      status: campaign.status,
      scheduled_at: toIsoOrNull(campaign.scheduledAt),
      created_at: campaign.createdAt.toISOString(),
      updated_at: campaign.updatedAt.toISOString(),
      stats: {
        total: campaign.stats.total,
        sent: campaign.stats.sent,
        failed: campaign.stats.failed,
        opened: campaign.stats.opened,
        open_rate: campaign.stats.openRate,
        send_rate: campaign.stats.sendRate,
      },
      recipients: campaign.recipients.map((recipient) => ({
        id: recipient.id,
        email: recipient.email,
        name: recipient.name,
        status: recipient.status,
        sent_at: toIsoOrNull(recipient.sentAt),
        opened_at: toIsoOrNull(recipient.openedAt),
      })),
    });
  },

  async update(req: Request, res: Response): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const campaignId = req.params.id;

    const campaign = await CampaignRepository.findById(campaignId);
    if (!campaign) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Campaign not found',
      });
      return;
    }

    if (campaign.createdBy !== authenticatedRequest.user.userId) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not have access to this campaign',
      });
      return;
    }

    if (campaign.status !== 'draft') {
      res.status(422).json({
        error: 'CAMPAIGN_NOT_DRAFT',
        message: 'Campaign can only be edited when status is draft',
      });
      return;
    }

    try {
      const payload = validateInput(campaignUpdateSchema, req.body);
      const trimmedPayload: { name?: string; subject?: string; body?: string } = {};

      if (payload.name !== undefined) {
        trimmedPayload.name = payload.name.trim();
      }

      if (payload.subject !== undefined) {
        trimmedPayload.subject = payload.subject.trim();
      }

      if (payload.body !== undefined) {
        trimmedPayload.body = payload.body.trim();
      }

      const updatedCampaign = await CampaignRepository.updateDraftById(campaignId, trimmedPayload);
      if (!updatedCampaign) {
        res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Campaign not found',
        });
        return;
      }

      res.status(200).json({
        id: updatedCampaign.id,
        name: updatedCampaign.name,
        subject: updatedCampaign.subject,
        status: updatedCampaign.status,
        updated_at: updatedCampaign.updatedAt.toISOString(),
      });
    } catch (err) {
      if (err instanceof ZodError) {
        sendValidationError(res, getValidationErrors(err));
        return;
      }
      throw err;
    }
  },

  async remove(req: Request, res: Response): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const campaignId = req.params.id;

    const campaign = await CampaignRepository.findById(campaignId);
    if (!campaign) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Campaign not found',
      });
      return;
    }

    if (campaign.createdBy !== authenticatedRequest.user.userId) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not have access to this campaign',
      });
      return;
    }

    if (campaign.status !== 'draft') {
      res.status(422).json({
        error: 'CAMPAIGN_NOT_DRAFT',
        message: 'Campaign can only be deleted when status is draft',
      });
      return;
    }

    await CampaignRepository.deleteById(campaignId);
    res.status(200).json({
      message: 'Campaign deleted successfully',
    });
  },

  async schedule(req: Request, res: Response): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const campaignId = req.params.id;

    const campaign = await CampaignRepository.findById(campaignId);
    if (!campaign) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Campaign not found',
      });
      return;
    }

    if (campaign.createdBy !== authenticatedRequest.user.userId) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not have access to this campaign',
      });
      return;
    }

    if (campaign.status !== 'draft') {
      res.status(422).json({
        error: 'CAMPAIGN_NOT_DRAFT',
        message: 'Campaign can only be scheduled when status is draft',
      });
      return;
    }

    try {
      const { scheduledAt: scheduledAtValue } = validateInput(campaignScheduleSchema, req.body);
      const scheduledAt = new Date(scheduledAtValue);

      if (scheduledAt.getTime() <= Date.now()) {
        res.status(422).json({
          error: 'SCHEDULED_AT_PAST',
          message: 'scheduled_at must be in the future',
        });
        return;
      }

      const updatedCampaign = await CampaignRepository.scheduleById(campaignId, scheduledAt);
      if (!updatedCampaign) {
        res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Campaign not found',
        });
        return;
      }

      res.status(200).json({
        id: updatedCampaign.id,
        status: updatedCampaign.status,
        scheduled_at: toIsoOrNull(updatedCampaign.scheduledAt),
      });
    } catch (err) {
      if (err instanceof ZodError) {
        sendValidationError(res, getValidationErrors(err));
        return;
      }
      throw err;
    }
  },

  async stats(req: Request, res: Response): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const campaignId = req.params.id;

    const campaign = await CampaignRepository.findById(campaignId);
    if (!campaign) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Campaign not found',
      });
      return;
    }

    if (campaign.createdBy !== authenticatedRequest.user.userId) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not have access to this campaign',
      });
      return;
    }

    const detail = await CampaignRepository.getDetailById(campaignId);
    if (!detail) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Campaign not found',
      });
      return;
    }

    res.status(200).json({
      total: detail.stats.total,
      sent: detail.stats.sent,
      failed: detail.stats.failed,
      opened: detail.stats.opened,
      open_rate: detail.stats.openRate,
      send_rate: detail.stats.sendRate,
    });
  },

  async send(req: Request, res: Response): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const campaignId = req.params.id;

    const campaign = await CampaignRepository.findById(campaignId);
    if (!campaign) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Campaign not found',
      });
      return;
    }

    if (campaign.createdBy !== authenticatedRequest.user.userId) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not have access to this campaign',
      });
      return;
    }

    if (campaign.status === 'sent') {
      res.status(422).json({
        error: 'CAMPAIGN_ALREADY_SENT',
        message: 'Campaign already sent',
      });
      return;
    }

    const recipientCount = await CampaignRepository.countRecipients(campaignId);
    if (recipientCount === 0) {
      res.status(422).json({
        error: 'NO_RECIPIENTS',
        message: 'Campaign has no recipients',
      });
      return;
    }

    await CampaignRepository.markAsSending(campaignId);
    await CampaignRepository.simulateSend(campaignId);
    await CampaignRepository.completeSend(campaignId);

    const detail = await CampaignRepository.getDetailById(campaignId);
    if (!detail) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Campaign not found',
      });
      return;
    }

    res.status(200).json({
      message: 'Campaign sent successfully',
      stats: {
        total: detail.stats.total,
        sent: detail.stats.sent,
        failed: detail.stats.failed,
        opened: detail.stats.opened,
        open_rate: detail.stats.openRate,
        send_rate: detail.stats.sendRate,
      },
    });
  },
};

export default CampaignController;
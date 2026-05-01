import { ZodError } from 'zod';
import { Request, Response } from 'express';
import RecipientRepository from '../repository/recipient.repo';
import { toIsoOrNull } from '../utils/format';
import {
  recipientSchema,
  sendValidationError,
  validateInput,
  getValidationErrors,
} from '../utils/validation';

const RecipientController = {
  async list(req: Request, res: Response): Promise<void> {
    const campaignId = req.query.campaignId;

    let recipients;
    if (campaignId && typeof campaignId === 'string') {
      recipients = await RecipientRepository.findByCampaignId(campaignId);
    } else {
      recipients = await RecipientRepository.findAll();
    }

    res.status(200).json({
      data: recipients.map((recipient) => ({
        id: recipient.id,
        email: recipient.email,
        name: recipient.name,
        created_at: toIsoOrNull(recipient.createdAt),
      })),
      pagination: {
        page: 1,
        limit: recipients.length,
        total: recipients.length,
      },
    });
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = validateInput(recipientSchema, req.body);

      const normalizedEmail = email.toLowerCase();
      const existingRecipient = await RecipientRepository.findByEmail(normalizedEmail);
      if (existingRecipient) {
        res.status(409).json({
          error: 'CONFLICT',
          message: 'Recipient email already exists',
        });
        return;
      }

      const recipient = await RecipientRepository.create({
        email: normalizedEmail,
        name: name.trim(),
      });

      res.status(201).json({
        id: recipient.id,
        email: recipient.email,
        name: recipient.name,
        created_at: toIsoOrNull(recipient.createdAt),
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

export default RecipientController;
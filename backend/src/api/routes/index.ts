import { Router } from 'express';
import authRouter from './user.route';
import campaignRouter from './campaign.route';
import recipientRouter from './recipient.route';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public routes - no auth required
router.use('/auth', authRouter);

// Protected routes - auth required
router.use('/campaigns', requireAuth, campaignRouter);
router.use('/recipients', requireAuth, recipientRouter);

export default router;

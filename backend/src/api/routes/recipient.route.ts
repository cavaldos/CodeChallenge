import { Router } from 'express';
import RecipientController from '../controllers/recipient.co';

const recipientRouter = Router();

recipientRouter.get('/', RecipientController.list);
recipientRouter.post('/', RecipientController.create);

export default recipientRouter;

/**
 * @swagger
 * /recipients:
 *   get:
 *     summary: List all recipients
 *     tags: [Recipients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: integer
 *         description: Filter by campaign ID
 *     responses:
 *       200:
 *         description: List of recipients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipient'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /recipients:
 *   post:
 *     summary: Create a new recipient
 *     tags: [Recipients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               campaignId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Recipient created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipient'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


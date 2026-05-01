import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../database/connection';

export type CampaignStatus = 'draft' | 'sending' | 'scheduled' | 'sent';
export type CampaignRecipientStatus = 'pending' | 'sent' | 'failed';

export interface CampaignEntity {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  scheduledAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignListItem extends CampaignEntity {
  stats: CampaignStats;
}

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  openRate: number;
  sendRate: number;
}

export interface CampaignRecipientDetail {
  id: string;
  email: string;
  name: string;
  status: CampaignRecipientStatus;
  sentAt: Date | null;
  openedAt: Date | null;
}

export interface CampaignDetail extends CampaignEntity {
  stats: CampaignStats;
  recipients: CampaignRecipientDetail[];
}

interface CreateCampaignInput {
  name: string;
  subject: string;
  body: string;
  status?: CampaignStatus;
  scheduledAt?: Date | null;
  createdBy: string;
}

interface UpdateCampaignInput {
  name?: string;
  subject?: string;
  body?: string;
}

interface CampaignRow {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  scheduled_at: Date | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface CampaignStatsRow {
  total: number | string;
  sent: number | string;
  failed: number | string;
  opened: number | string;
}

interface CampaignRecipientRow {
  id: string;
  email: string;
  name: string;
  status: CampaignRecipientStatus;
  sent_at: Date | null;
  opened_at: Date | null;
}

function mapCampaignRow(row: CampaignRow): CampaignEntity {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    body: row.body,
    status: row.status,
    scheduledAt: row.scheduled_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRate(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return Number((numerator / denominator).toFixed(2));
}

function mapStatsRow(row: CampaignStatsRow): CampaignStats {
  const total = Number(row.total);
  const sent = Number(row.sent);
  const failed = Number(row.failed);
  const opened = Number(row.opened);

  return {
    total,
    sent,
    failed,
    opened,
    openRate: toRate(opened, sent),
    sendRate: toRate(sent, total),
  };
}

function mapRecipientDetailRow(row: CampaignRecipientRow): CampaignRecipientDetail {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    status: row.status,
    sentAt: row.sent_at,
    openedAt: row.opened_at,
  };
}

function firstRow<T>(result: [T[], unknown]): T | null {
  return result[0][0] ?? null;
}

const CampaignRepository = {
  async findAllByUser(userId: string, status?: CampaignStatus): Promise<CampaignListItem[]> {
    const rows = await sequelize.query<CampaignRow & CampaignStatsRow>(
      `SELECT
          c.id,
          c.name,
          c.subject,
          c.body,
          c.status,
          c.scheduled_at,
          c.created_by,
          c.created_at,
          c.updated_at,
          COUNT(cr.recipient_id) AS total,
          COUNT(cr.recipient_id) FILTER (WHERE cr.status = 'sent') AS sent,
          COUNT(cr.recipient_id) FILTER (WHERE cr.status = 'failed') AS failed,
          COUNT(cr.recipient_id) FILTER (WHERE cr.opened_at IS NOT NULL) AS opened
       FROM campaigns c
       LEFT JOIN campaign_recipients cr ON cr.campaign_id = c.id
       WHERE c.created_by = :userId
         AND (:status IS NULL OR c.status = :status)
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      {
        replacements: { userId, status: status ?? null },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map((row) => ({
      ...mapCampaignRow(row),
      stats: mapStatsRow(row),
    }));
  },

  async findById(id: string): Promise<CampaignEntity | null> {
    const row = await sequelize.query<CampaignRow>(
      `SELECT id, name, subject, body, status, scheduled_at, created_by, created_at, updated_at
       FROM campaigns
       WHERE id = :id
       LIMIT 1`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    return row ? mapCampaignRow(row) : null;
  },

  async create(input: CreateCampaignInput, transaction?: Transaction): Promise<CampaignEntity> {
    const result = (await sequelize.query(
      `INSERT INTO campaigns (name, subject, body, status, scheduled_at, created_by)
       VALUES (:name, :subject, :body, :status, :scheduledAt, :createdBy)
       RETURNING id, name, subject, body, status, scheduled_at, created_by, created_at, updated_at`,
      {
        replacements: {
          name: input.name,
          subject: input.subject,
          body: input.body,
          status: input.status ?? 'draft',
          scheduledAt: input.scheduledAt ?? null,
          createdBy: input.createdBy,
        },
        transaction,
      },
    )) as [CampaignRow[], unknown];

    const row = firstRow(result);
    if (!row) {
      throw new Error('Failed to create campaign');
    }

    return mapCampaignRow(row);
  },

  async attachRecipients(campaignId: string, recipientIds: string[], transaction?: Transaction): Promise<void> {
    if (recipientIds.length === 0) {
      return;
    }

    await sequelize.query(
      `INSERT INTO campaign_recipients (campaign_id, recipient_id)
       VALUES ${recipientIds.map((_, index) => `(:campaignId, :recipientId${index})`).join(', ')}`,
      {
        replacements: recipientIds.reduce<Record<string, string>>(
          (accumulator, recipientId, index) => {
            accumulator[`recipientId${index}`] = recipientId;
            return accumulator;
          },
          { campaignId },
        ),
        transaction,
      },
    );
  },

  async getDetailById(id: string): Promise<CampaignDetail | null> {
    const campaign = await this.findById(id);

    if (!campaign) {
      return null;
    }

    const statsRow = await sequelize.query<CampaignStatsRow>(
      `SELECT
          COUNT(recipient_id) AS total,
          COUNT(recipient_id) FILTER (WHERE status = 'sent') AS sent,
          COUNT(recipient_id) FILTER (WHERE status = 'failed') AS failed,
          COUNT(recipient_id) FILTER (WHERE opened_at IS NOT NULL) AS opened
       FROM campaign_recipients
       WHERE campaign_id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    const recipientRows = await sequelize.query<CampaignRecipientRow>(
      `SELECT
          r.id,
          r.email,
          r.name,
          cr.status,
          cr.sent_at,
          cr.opened_at
       FROM campaign_recipients cr
       INNER JOIN recipients r ON r.id = cr.recipient_id
       WHERE cr.campaign_id = :id
       ORDER BY r.created_at DESC`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      },
    );

    return {
      ...campaign,
      stats: mapStatsRow(
        statsRow ?? {
          total: 0,
          sent: 0,
          failed: 0,
          opened: 0,
        },
      ),
      recipients: recipientRows.map(mapRecipientDetailRow),
    };
  },

  async updateDraftById(id: string, input: UpdateCampaignInput): Promise<CampaignEntity | null> {
    const updates: string[] = [];
    const replacements: Record<string, string> = { id };

    if (typeof input.name === 'string') {
      updates.push('name = :name');
      replacements.name = input.name;
    }

    if (typeof input.subject === 'string') {
      updates.push('subject = :subject');
      replacements.subject = input.subject;
    }

    if (typeof input.body === 'string') {
      updates.push('body = :body');
      replacements.body = input.body;
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    const result = (await sequelize.query(
      `UPDATE campaigns
       SET ${updates.join(', ')}
       WHERE id = :id
       RETURNING id, name, subject, body, status, scheduled_at, created_by, created_at, updated_at`,
      {
        replacements,
      },
    )) as [CampaignRow[], unknown];

    const row = firstRow(result);
    return row ? mapCampaignRow(row) : null;
  },

  async deleteById(id: string): Promise<boolean> {
    const result = (await sequelize.query(
      `DELETE FROM campaigns
       WHERE id = :id`,
      {
        replacements: { id },
      },
    )) as [unknown, number];

    return Number(result[1]) > 0;
  },

  async scheduleById(id: string, scheduledAt: Date): Promise<CampaignEntity | null> {
    const result = (await sequelize.query(
      `UPDATE campaigns
       SET status = 'scheduled', scheduled_at = :scheduledAt
       WHERE id = :id
       RETURNING id, name, subject, body, status, scheduled_at, created_by, created_at, updated_at`,
      {
        replacements: { id, scheduledAt },
      },
    )) as [CampaignRow[], unknown];

    const row = firstRow(result);
    return row ? mapCampaignRow(row) : null;
  },

  async markAsSending(id: string): Promise<CampaignEntity | null> {
    const result = (await sequelize.query(
      `UPDATE campaigns
       SET status = 'sending'
       WHERE id = :id
       RETURNING id, name, subject, body, status, scheduled_at, created_by, created_at, updated_at`,
      {
        replacements: { id },
      },
    )) as [CampaignRow[], unknown];

    const row = firstRow(result);
    return row ? mapCampaignRow(row) : null;
  },

  async completeSend(id: string): Promise<CampaignEntity | null> {
    const result = (await sequelize.query(
      `UPDATE campaigns
       SET status = 'sent'
       WHERE id = :id
       RETURNING id, name, subject, body, status, scheduled_at, created_by, created_at, updated_at`,
      {
        replacements: { id },
      },
    )) as [CampaignRow[], unknown];

    const row = firstRow(result);
    return row ? mapCampaignRow(row) : null;
  },

  async countRecipients(campaignId: string): Promise<number> {
    const row = await sequelize.query<{ total: number | string }>(
      `SELECT COUNT(recipient_id) AS total
       FROM campaign_recipients
       WHERE campaign_id = :campaignId`,
      {
        replacements: { campaignId },
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    return row ? Number(row.total) : 0;
  },

  async simulateSend(campaignId: string): Promise<void> {
    const recipientRows = await sequelize.query<{ recipient_id: string }>(
      `SELECT recipient_id
       FROM campaign_recipients
       WHERE campaign_id = :campaignId`,
      {
        replacements: { campaignId },
        type: QueryTypes.SELECT,
      },
    );

    for (const recipient of recipientRows) {
      const isSent = Math.random() < 0.9;

      await sequelize.query(
        `UPDATE campaign_recipients
         SET status = :status,
             sent_at = :sentAt
         WHERE campaign_id = :campaignId
           AND recipient_id = :recipientId`,
        {
          replacements: {
            campaignId,
            recipientId: recipient.recipient_id,
            status: isSent ? 'sent' : 'failed',
            sentAt: isSent ? new Date() : null,
          },
        },
      );
    }
  },
};

export default CampaignRepository;

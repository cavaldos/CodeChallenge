import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../database/connection';

export interface RecipientEntity {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface CreateRecipientInput {
  email: string;
  name: string;
}

interface RecipientRow {
  id: string;
  email: string;
  name: string;
  created_at: Date;
}

function mapRecipientRow(row: RecipientRow): RecipientEntity {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
  };
}

const RecipientRepository = {
  async findAll(): Promise<RecipientEntity[]> {
    const rows = await sequelize.query<RecipientRow>(
      `SELECT id, email, name, created_at
       FROM recipients
       ORDER BY created_at DESC`,
      {
        type: QueryTypes.SELECT,
      },
    );

    return rows.map(mapRecipientRow);
  },

  async findById(id: string): Promise<RecipientEntity | null> {
    const row = await sequelize.query<RecipientRow>(
      `SELECT id, email, name, created_at
       FROM recipients
       WHERE id = :id
       LIMIT 1`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    return row ? mapRecipientRow(row) : null;
  },

  async findByEmail(email: string): Promise<RecipientEntity | null> {
    const row = await sequelize.query<RecipientRow>(
      `SELECT id, email, name, created_at
       FROM recipients
       WHERE email = :email
       LIMIT 1`,
      {
        replacements: { email },
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    return row ? mapRecipientRow(row) : null;
  },

  async findByIds(ids: string[]): Promise<RecipientEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await sequelize.query<RecipientRow>(
      `SELECT id, email, name, created_at
       FROM recipients
       WHERE id IN (:ids)
       ORDER BY created_at DESC`,
      {
        replacements: { ids },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map(mapRecipientRow);
  },

  async create(input: CreateRecipientInput, transaction?: Transaction): Promise<RecipientEntity> {
    const result = (await sequelize.query(
      `INSERT INTO recipients (email, name)
       VALUES (:email, :name)
       RETURNING id, email, name, created_at`,
      {
        replacements: {
          email: input.email,
          name: input.name,
        },
        transaction,
      },
    )) as [RecipientRow[], unknown];

    const row = result[0][0];
    return mapRecipientRow(row);
  },

  async findByCampaignId(campaignId: string): Promise<RecipientEntity[]> {
    const rows = await sequelize.query<RecipientRow>(
      `SELECT r.id, r.email, r.name, r.created_at
       FROM recipients r
       INNER JOIN campaign_recipients cr ON cr.recipient_id = r.id
       WHERE cr.campaign_id = :campaignId
       ORDER BY r.created_at DESC`,
      {
        replacements: { campaignId },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map(mapRecipientRow);
  },
};

export default RecipientRepository;

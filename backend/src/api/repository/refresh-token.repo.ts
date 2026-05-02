import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../database/connection';

interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  revoked_at: Date | null;
  expires_at: Date;
  created_at: Date;
}

interface CreateRefreshTokenInput {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

function mapRow(row: RefreshTokenRow) {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    revokedAt: row.revoked_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

const RefreshTokenRepository = {
  async create(input: CreateRefreshTokenInput, transaction?: Transaction): Promise<void> {
    await sequelize.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
       VALUES (:id, :userId, :tokenHash, :expiresAt)`,
      {
        replacements: {
          id: input.id,
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
        transaction,
      },
    );
  },

  async findActiveById(id: string) {
    const row = await sequelize.query<RefreshTokenRow>(
      `SELECT id, user_id, token_hash, revoked_at, expires_at, created_at
       FROM refresh_tokens
       WHERE id = :id
         AND revoked_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    return row ? mapRow(row) : null;
  },

  async revokeById(id: string): Promise<void> {
    await sequelize.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE id = :id
         AND revoked_at IS NULL`,
      {
        replacements: { id },
      },
    );
  },

  async revokeAllByUserId(userId: string): Promise<void> {
    await sequelize.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE user_id = :userId
         AND revoked_at IS NULL`,
      {
        replacements: { userId },
      },
    );
  },

  async deleteExpired(): Promise<void> {
    await sequelize.query(
      `DELETE FROM refresh_tokens
       WHERE expires_at <= NOW()`,
    );
  },
};

export default RefreshTokenRepository;

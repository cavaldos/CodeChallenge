import { QueryTypes, Transaction } from 'sequelize';
import sequelize from '../../database/connection';

export interface UserEntity {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
}

function mapUserRow(row: UserRow): UserEntity {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

const UserRepository = {
  async findById(id: string): Promise<UserEntity | null> {
    const row = await sequelize.query<UserRow>(
      `SELECT id, email, name, password_hash, created_at
       FROM users
       WHERE id = :id
       LIMIT 1`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    return row ? mapUserRow(row) : null;
  },

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await sequelize.query<UserRow>(
      `SELECT id, email, name, password_hash, created_at
       FROM users
       WHERE email = :email
       LIMIT 1`,
      {
        replacements: { email },
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    return row ? mapUserRow(row) : null;
  },

  async create(input: CreateUserInput, transaction?: Transaction): Promise<UserEntity> {
    const result = (await sequelize.query(
      `INSERT INTO users (email, name, password_hash)
       VALUES (:email, :name, :passwordHash)
       RETURNING id, email, name, password_hash, created_at`,
      {
        replacements: {
          email: input.email,
          name: input.name,
          passwordHash: input.passwordHash,
        },
        transaction,
      },
    )) as [UserRow[], unknown];

    const row = result[0][0];
    return mapUserRow(row);
  },
};

export default UserRepository;

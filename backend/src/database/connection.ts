import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

const DB_HOST = process.env.DB_HOST || '192.168.1.16';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');
const DB_NAME = process.env.DB_NAME || 'app_db';
const DB_USER = process.env.DB_USER || 'app_user';
const DB_PASSWORD = process.env.DB_PASSWORD || 'CodeChallenge2024';

/**
 * Sequelize instance for PostgreSQL database connection
 * Uses config from database/postgreSQL.yaml:
 * - Host: 192.168.1.16
 * - Port: 5432
 * - Database: app_db
 * - User: app_user
 * - Password: CodeChallenge2024
 */
export const sequelize = new Sequelize({
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    connectTimeout: 10000,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * Format database error into a clean, single-line message.
 */
function formatDbError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code
      ?? (error as { parent?: { code?: string } }).parent?.code;
    const msg = error.message.split('\n')[0]; // strip Sequelize stack prefix lines
    return code ? `[${code}] ${msg}` : msg;
  }
  return String(error);
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    console.log(`  ✅  ➜  PostgreSQL:  ${DB_HOST}:${DB_PORT}`);
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL database:', formatDbError(error));
    return false;
  }
}

export default sequelize;
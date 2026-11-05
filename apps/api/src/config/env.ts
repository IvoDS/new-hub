import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',

  DB_DIALECT: (process.env.DB_DIALECT || 'mariadb') as 'mariadb' | 'sqlite',
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_NAME: process.env.DB_NAME || 'hub_db',
  DB_USER: process.env.DB_USER || 'hub_user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'hub_password',
  DB_FALLBACK_SQLITE: process.env.DB_FALLBACK_SQLITE !== 'false',
  DB_SQLITE_STORAGE: process.env.DB_SQLITE_STORAGE || path.resolve(process.cwd(), 'dev_local.sqlite'),

  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  ALLOW_DEV_ADMIN_BYPASS: process.env.ALLOW_DEV_ADMIN_BYPASS === 'true',
  DEV_ADMIN_TOKEN: process.env.DEV_ADMIN_TOKEN || 'dev-secret-token',

  CADDY_ADMIN_URL: process.env.CADDY_ADMIN_URL || 'http://127.0.0.1:2019',
  CADDY_BLUE_UPSTREAM: process.env.CADDY_BLUE_UPSTREAM || '127.0.0.1:3001',
  CADDY_GREEN_UPSTREAM: process.env.CADDY_GREEN_UPSTREAM || '127.0.0.1:3002',

  UPLOAD_DIR: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
};

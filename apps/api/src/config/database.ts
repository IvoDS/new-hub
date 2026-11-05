import { Sequelize } from 'sequelize';
import { env } from './env.js';

let sequelize: Sequelize;

export function initSequelize(): Sequelize {
  if (sequelize) return sequelize;

  if (env.DB_DIALECT === 'mariadb') {
    try {
      sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
        host: env.DB_HOST,
        port: env.DB_PORT,
        dialect: 'mariadb',
        logging: env.NODE_ENV === 'development' ? false : false,
        dialectOptions: {
          connectTimeout: 3000,
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      });
    } catch (err) {
      if (env.DB_FALLBACK_SQLITE) {
        console.warn('⚠️ [DB] MariaDB initialization failed, falling back to local SQLite:', err);
        sequelize = new Sequelize({
          dialect: 'sqlite',
          storage: env.DB_SQLITE_STORAGE,
          logging: false,
        });
      } else {
        throw err;
      }
    }
  } else {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: env.DB_SQLITE_STORAGE,
      logging: false,
    });
  }

  return sequelize;
}

export async function connectDatabase(): Promise<Sequelize> {
  const db = initSequelize();
  try {
    await db.authenticate();
    console.log(`✅ [DB] Connected successfully using ${db.getDialect()} dialect.`);
    return db;
  } catch (err) {
    if (env.DB_DIALECT === 'mariadb' && env.DB_FALLBACK_SQLITE) {
      console.warn(`⚠️ [DB] Could not authenticate with MariaDB at ${env.DB_HOST}:${env.DB_PORT}. Switching to local SQLite.`);
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: env.DB_SQLITE_STORAGE,
        logging: false,
      });
      await sequelize.authenticate();
      console.log(`✅ [DB] Connected to SQLite fallback storage (${env.DB_SQLITE_STORAGE}).`);
      return sequelize;
    }
    console.error('❌ [DB] Unable to connect to database:', err);
    throw err;
  }
}

export { sequelize };

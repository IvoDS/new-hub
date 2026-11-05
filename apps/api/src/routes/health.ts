import { FastifyInstance } from 'fastify';
import { sequelize } from '../config/database.js';
import { env } from '../config/env.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async () => {
    let dbStatus = 'disconnected';
    try {
      if (sequelize) {
        await sequelize.authenticate();
        dbStatus = `connected (${sequelize.getDialect()})`;
      }
    } catch {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      service: 'ivandestefani-hub-api',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: dbStatus,
    };
  });

  // Auth identity / session endpoint
  fastify.get('/auth/me', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request) => {
    return {
      success: true,
      data: request.user,
    };
  });
}

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

  // SSO Login / Token Exchange endpoint with strict whitelist check
  fastify.post<{ Body: { email: string; name?: string; provider?: 'google' | 'apple' } }>(
    '/auth/sso-exchange',
    async (request, reply) => {
      const { email, name, provider = 'google' } = request.body || {};
      if (!email) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Email is required' },
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!env.ADMIN_EMAILS.includes(normalizedEmail)) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'EMAIL_NOT_AUTHORIZED',
            message: `Email '${email}' is not authorized to access the administration panel. Access is strictly restricted to the system owner.`,
          },
        });
      }

      // Generate signed JWT for the authorized admin
      const token = (fastify as any).jwt.sign(
        {
          id: `admin-${normalizedEmail}`,
          email: normalizedEmail,
          name: name || 'Ivan De Stefani',
          role: 'admin',
          provider,
        },
        { expiresIn: '7d' }
      );

      return reply.send({
        success: true,
        data: {
          token,
          user: {
            email: normalizedEmail,
            name: name || 'Ivan De Stefani',
            role: 'admin',
            provider,
          },
        },
      });
    }
  );
}

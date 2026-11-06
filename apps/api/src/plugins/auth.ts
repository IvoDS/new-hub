import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '../config/env.js';
import type { AuthUser } from '@hub/shared';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthUser;
    user: AuthUser;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    adminUser?: AuthUser;
  }
}

export const authPlugin = fp(async function (fastify: FastifyInstance) {
  fastify.decorate('authenticateAdmin', async function (request: FastifyRequest, reply: FastifyReply) {
    // 1. Check local dev bypass if enabled
    if (env.ALLOW_DEV_ADMIN_BYPASS) {
      const devHeader = request.headers['x-dev-admin'];
      const authHeader = request.headers.authorization;

      if (
        devHeader === 'true' ||
        authHeader === `Bearer ${env.DEV_ADMIN_TOKEN}` ||
        authHeader === 'Bearer dev-mock-token' ||
        env.NODE_ENV === 'development'
      ) {
        const devUser: AuthUser = {
          id: 'dev-admin-id',
          email: 'admin@ivandestefani.it',
          name: 'Ivan De Stefani (Dev Admin)',
          role: 'admin',
          provider: 'dev',
        };
        request.user = devUser;
        request.adminUser = devUser;
        return;
      }
    }

    // 2. Real JWT token verification
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Missing Bearer token.',
          },
        });
      }

      const decoded = (await (request as any).jwtVerify()) as AuthUser;
      if (decoded.role !== 'admin') {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Admin privileges required.',
          },
        });
      }

      // Strict email whitelist check
      const userEmail = (decoded.email || '').toLowerCase();
      const isAuthorizedEmail = env.ADMIN_EMAILS.includes(userEmail);

      if (!isAuthorizedEmail) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'EMAIL_NOT_AUTHORIZED',
            message: `Access denied. Email '${decoded.email}' is not in the authorized administrator whitelist.`,
          },
        });
      }

      request.user = decoded;
      request.adminUser = decoded;
    } catch (err: any) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token.',
          details: err.message,
        },
      });
    }
  });
});

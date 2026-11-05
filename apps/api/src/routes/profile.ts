import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProfileModel } from '../models/ProfileModel.js';
import type { ApiResponse, UpdateProfileInput } from '@hub/shared';

export async function profileRoutes(fastify: FastifyInstance) {
  // Public: Get profile info
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const profile = await ProfileModel.findOne();
    if (!profile) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Profile not found' },
      });
    }

    const response: ApiResponse<typeof profile> = {
      success: true,
      data: profile,
    };
    return reply.send(response);
  });

  // Admin: Update profile info
  fastify.put<{ Body: UpdateProfileInput }>('/', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request, reply) => {
    let profile = await ProfileModel.findOne();
    if (!profile) {
      profile = await ProfileModel.create(request.body as any);
    } else {
      await profile.update(request.body as any);
    }

    return reply.send({
      success: true,
      data: profile,
      message: 'Profile updated successfully',
    });
  });
}

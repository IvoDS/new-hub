import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SiteContentModel } from '../models/SiteContentModel.js';
import { DEFAULT_SITE_CONTENT, ApiResponse, UpdateSiteContentInput } from '@hub/shared';

export async function contentRoutes(fastify: FastifyInstance) {
  // Public: Get site content and competencies
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    let content = await SiteContentModel.findOne();
    if (!content) {
      content = await SiteContentModel.create({
        hero: DEFAULT_SITE_CONTENT.hero,
        competencies: DEFAULT_SITE_CONTENT.competencies,
      });
    }

    const response: ApiResponse<typeof content> = {
      success: true,
      data: content,
    };
    return reply.send(response);
  });

  // Admin: Update site content & competencies
  fastify.put<{ Body: UpdateSiteContentInput }>('/', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request, reply) => {
    let content = await SiteContentModel.findOne();
    const body = request.body || {};

    if (!content) {
      content = await SiteContentModel.create({
        hero: body.hero || DEFAULT_SITE_CONTENT.hero,
        competencies: body.competencies || DEFAULT_SITE_CONTENT.competencies,
      });
    } else {
      if (body.hero) content.hero = body.hero;
      if (body.competencies) content.competencies = body.competencies;
      await content.save();
    }

    return reply.send({
      success: true,
      data: content,
      message: 'Site content and competencies updated successfully',
    });
  });

  // Admin: Reset site content to defaults
  fastify.post('/reset', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request, reply) => {
    let content = await SiteContentModel.findOne();
    if (!content) {
      content = await SiteContentModel.create({
        hero: DEFAULT_SITE_CONTENT.hero,
        competencies: DEFAULT_SITE_CONTENT.competencies,
      });
    } else {
      content.hero = DEFAULT_SITE_CONTENT.hero;
      content.competencies = DEFAULT_SITE_CONTENT.competencies;
      await content.save();
    }

    return reply.send({
      success: true,
      data: content,
      message: 'Site content restored to defaults',
    });
  });
}

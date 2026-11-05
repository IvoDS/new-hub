import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProjectModel } from '../models/ProjectModel.js';
import type { ApiResponse, CreateProjectInput, UpdateProjectInput } from '@hub/shared';

export async function projectRoutes(fastify: FastifyInstance) {
  // Public: List all published projects (ordered)
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const projects = await ProjectModel.findAll({
      where: { published: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });

    const response: ApiResponse<typeof projects> = {
      success: true,
      data: projects,
    };
    return reply.send(response);
  });

  // Public: Get project by slug
  fastify.get('/:slug', async (request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) => {
    const { slug } = request.params;
    const project = await ProjectModel.findOne({ where: { slug } });

    if (!project) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: `Project with slug '${slug}' not found` },
      });
    }

    return reply.send({ success: true, data: project });
  });

  // Admin: List all projects (including unpublished)
  fastify.get('/admin/all', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const projects = await ProjectModel.findAll({
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });

    return reply.send({ success: true, data: projects });
  });

  // Admin: Create project
  fastify.post<{ Body: CreateProjectInput }>('/', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request, reply) => {
    const body = request.body;
    if (!body?.title || !body?.slug) {
      return reply.status(400).send({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Title and slug are required' },
      });
    }

    const created = await ProjectModel.create(body as any);
    return reply.status(201).send({ success: true, data: created, message: 'Project created successfully' });
  });

  // Admin: Update project
  fastify.put<{ Params: { id: string }; Body: UpdateProjectInput }>('/:id', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request, reply) => {
    const { id } = request.params;
    const project = await ProjectModel.findByPk(id);

    if (!project) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: `Project '${id}' not found` },
      });
    }

    await project.update(request.body as any);
    return reply.send({ success: true, data: project, message: 'Project updated successfully' });
  });

  // Admin: Delete project
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request, reply) => {
    const { id } = request.params;
    const project = await ProjectModel.findByPk(id);

    if (!project) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: `Project '${id}' not found` },
      });
    }

    await project.destroy();
    return reply.send({ success: true, data: { id }, message: 'Project deleted successfully' });
  });
}

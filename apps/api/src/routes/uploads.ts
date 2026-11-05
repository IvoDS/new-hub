import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { env } from '../config/env.js';

export async function uploadRoutes(fastify: FastifyInstance) {
  // Ensure uploads directory exists
  if (!fs.existsSync(env.UPLOAD_DIR)) {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  }

  // Admin upload file
  fastify.post('/', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({
        success: false,
        error: { code: 'NO_FILE', message: 'No file provided in form-data' },
      });
    }

    const safeFilename = `${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const destinationPath = path.join(env.UPLOAD_DIR, safeFilename);

    await pipeline(data.file, fs.createWriteStream(destinationPath));

    const publicUrl = `/uploads/${safeFilename}`;
    return reply.status(201).send({
      success: true,
      data: {
        filename: safeFilename,
        originalFilename: data.filename,
        mimetype: data.mimetype,
        url: publicUrl,
      },
      message: 'File uploaded successfully',
    });
  });

  // List existing files in uploads
  fastify.get('/', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (!fs.existsSync(env.UPLOAD_DIR)) {
      return reply.send({ success: true, data: [] });
    }

    const files = fs.readdirSync(env.UPLOAD_DIR)
      .filter(f => !f.startsWith('.'))
      .map(filename => {
        const stats = fs.statSync(path.join(env.UPLOAD_DIR, filename));
        return {
          filename,
          sizeBytes: stats.size,
          createdAt: stats.birthtime,
          url: `/uploads/${filename}`,
        };
      });

    return reply.send({ success: true, data: files });
  });
}

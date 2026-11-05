import fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';

import { env } from './config/env.js';
import { syncDatabase } from './models/index.js';
import { authPlugin } from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { projectRoutes } from './routes/projects.js';
import { profileRoutes } from './routes/profile.js';
import { deploymentRoutes } from './routes/deployments.js';
import { uploadRoutes } from './routes/uploads.js';

export async function buildApp() {
  const app = fastify({
    logger: env.NODE_ENV === 'development' ? {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    } : true,
  });

  // Enable CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-dev-admin'],
  });

  // JWT Support
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });

  // Multipart File Upload Support
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max file size
    },
  });

  // Ensure uploads folder exists
  if (!fs.existsSync(env.UPLOAD_DIR)) {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  }

  // Serve uploads statically
  await app.register(fastifyStatic, {
    root: env.UPLOAD_DIR,
    prefix: '/uploads/',
  });

  // Auth Decorator & Plugin
  await app.register(authPlugin);

  // Register Routes
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(projectRoutes, { prefix: '/api/projects' });
  await app.register(profileRoutes, { prefix: '/api/profile' });
  await app.register(deploymentRoutes, { prefix: '/api/deployments' });
  await app.register(uploadRoutes, { prefix: '/api/uploads' });

  return app;
}

export async function start() {
  try {
    console.log('🚀 Initializing ivandestefani-hub backend...');
    await syncDatabase();

    const app = await buildApp();
    await app.listen({ port: env.PORT, host: env.HOST });

    console.log(`📡 Backend API listening on http://${env.HOST}:${env.PORT}`);
    console.log(`📁 Uploads available at http://${env.HOST}:${env.PORT}/uploads`);
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

// Start if executed directly
if (process.env.NODE_ENV !== 'test') {
  start();
}

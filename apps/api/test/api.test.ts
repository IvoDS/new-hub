import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/server.js';
import { syncDatabase } from '../src/models/index.js';
import type { FastifyInstance } from 'fastify';

describe('Hub API Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_FALLBACK_SQLITE = 'true';
    process.env.DB_SQLITE_STORAGE = ':memory:';
    process.env.ALLOW_DEV_ADMIN_BYPASS = 'true';

    await syncDatabase();
    app = await buildApp();
  });

  it('GET /api/health should return ok status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('ivandestefani-hub-api');
  });

  it('GET /api/projects should return seeded projects', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/projects',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty('title');
  });

  it('GET /api/profile should return bio and skills', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/profile',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.fullName).toBe('Ivan De Stefani');
    expect(body.data.skills.length).toBeGreaterThan(0);
  });

  it('GET /api/deployments should return current Caddy routing state', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/deployments',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.routing).toBeDefined();
    expect(body.data.routing.activeSlot).toBe('blue');
  });

  it('POST /api/deployments/switch should switch slot with dev bypass auth', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/deployments/switch',
      headers: {
        'x-dev-admin': 'true',
        'content-type': 'application/json',
      },
      payload: {
        targetSlot: 'green',
        notes: 'Switching to green container for verification',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.state.activeSlot).toBe('green');
  });

  it('POST /api/deployments/rollback should revert to previous slot', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/deployments/rollback',
      headers: {
        'x-dev-admin': 'true',
        'content-type': 'application/json',
      },
      payload: {
        reason: 'Automated test rollback',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.state.activeSlot).toBe('blue');
  });

  it('POST /api/auth/sso-exchange should reject unauthorized email with 403', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/sso-exchange',
      payload: {
        email: 'unauthorized-stranger@gmail.com',
        name: 'Random User',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('EMAIL_NOT_AUTHORIZED');
  });

  it('POST /api/auth/sso-exchange should accept authorized admin email and issue valid JWT', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/sso-exchange',
      payload: {
        email: 'contact@ivandestefani.it',
        name: 'Ivan De Stefani',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();

    // Verify token grants access to protected admin route
    const adminCheck = await app.inject({
      method: 'GET',
      url: '/api/projects/admin/all',
      headers: {
        Authorization: `Bearer ${body.data.token}`,
      },
    });

    expect(adminCheck.statusCode).toBe(200);
  });
});

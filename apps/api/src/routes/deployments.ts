import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DeploymentModel } from '../models/DeploymentModel.js';
import { caddyService } from '../services/caddyService.js';
import { deploymentRunnerService } from '../services/deploymentRunnerService.js';
import type { DeploymentSlot, SwitchSlotRequest, RollbackRequest, TriggerDeployRequest, AuthUser } from '@hub/shared';

interface WebhookBody {
  projectName?: string;
  repository?: string;
  branch?: string;
  commitHash?: string;
  commitMessage?: string;
  imageTag?: string;
}

export async function deploymentRoutes(fastify: FastifyInstance) {
  // Public/Admin: Get deployment status & routing state
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const routing = await caddyService.getRoutingState();
    const history = await DeploymentModel.findAll({
      order: [['deployedAt', 'DESC']],
      limit: 20,
    });

    return reply.send({
      success: true,
      data: {
        routing,
        history,
      },
    });
  });

  // Public/Admin: Get live status of running deployment pipeline & build logs
  fastify.get('/live-status', async (_request: FastifyRequest, reply: FastifyReply) => {
    const liveStatus = deploymentRunnerService.getStatus();
    return reply.send({
      success: true,
      data: liveStatus,
    });
  });

  // Admin: Single-Button Deploy - Trigger git pull, Docker build & optional zero-downtime switch
  fastify.post<{ Body: TriggerDeployRequest }>('/trigger-build', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request, reply) => {
    const { targetSlot, autoSwitch = false } = request.body || {};

    let chosenSlot: DeploymentSlot;
    if (targetSlot) {
      if (targetSlot !== 'blue' && targetSlot !== 'green') {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: "Target slot must be either 'blue' or 'green'" },
        });
      }
      chosenSlot = targetSlot;
    } else {
      // Auto-detect standby slot
      const currentRouting = await caddyService.getRoutingState();
      chosenSlot = currentRouting.activeSlot === 'blue' ? 'green' : 'blue';
    }

    const user = request.adminUser || (request.user as AuthUser | undefined);

    try {
      const result = await deploymentRunnerService.triggerDeploy({
        targetSlot: chosenSlot,
        autoSwitch: !!autoSwitch,
        approvedBy: user?.name || user?.email || 'Ivan De Stefani (Admin)',
      });

      return reply.status(202).send({
        success: true,
        message: `Deployment triggered for slot ${chosenSlot.toUpperCase()}${autoSwitch ? ' with auto-traffic-switch' : ''}.`,
        data: result,
      });
    } catch (err: any) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'DEPLOYMENT_CONFLICT',
          message: err.message || 'Deployment could not be started.',
        },
      });
    }
  });

  // Admin: Trigger Blue/Green traffic switch via Caddy
  fastify.post<{ Body: SwitchSlotRequest }>('/switch', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request, reply) => {
    const { targetSlot } = request.body || {};
    if (!targetSlot || (targetSlot !== 'blue' && targetSlot !== 'green')) {
      return reply.status(400).send({
        success: false,
        error: { code: 'BAD_REQUEST', message: "Target slot must be either 'blue' or 'green'" },
      });
    }

    const switchResult = await caddyService.switchTraffic(targetSlot);
    const user = request.adminUser || (request.user as AuthUser | undefined);

    // Update or create deployment record
    await DeploymentModel.create({
      projectName: 'ivandestefani-hub',
      repository: 'ivandestefani/new-hub',
      branch: 'main',
      commitHash: Math.random().toString(16).substring(2, 9),
      commitMessage: `Manual traffic switch to ${targetSlot.toUpperCase()}`,
      imageTag: `ivandestefani-hub:v${Date.now().toString().slice(-4)}-${targetSlot}`,
      slot: targetSlot,
      status: 'active',
      upstreamUrl: switchResult.state.activeUpstream,
      deployedAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      approvedBy: user?.name || 'Ivan De Stefani',
    });

    return reply.send({
      success: true,
      data: switchResult,
      message: switchResult.message,
    });
  });

  // Admin: Trigger instant rollback
  fastify.post<{ Body: RollbackRequest }>('/rollback', {
    preHandler: (fastify as any).authenticateAdmin,
  }, async (request, reply) => {
    const rollbackResult = await caddyService.rollback();
    const user = request.adminUser || (request.user as AuthUser | undefined);

    await DeploymentModel.create({
      projectName: 'ivandestefani-hub',
      repository: 'ivandestefani/new-hub',
      branch: 'main',
      commitHash: Math.random().toString(16).substring(2, 9),
      commitMessage: `Rollback triggered: ${request.body?.reason || 'Critical issue detected'}`,
      imageTag: `ivandestefani-hub:rollback-${rollbackResult.state.activeSlot}`,
      slot: rollbackResult.state.activeSlot,
      status: 'rolled_back',
      upstreamUrl: rollbackResult.state.activeUpstream,
      deployedAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      approvedBy: user?.name || 'Ivan De Stefani (Rollback)',
    });

    return reply.send({
      success: true,
      data: rollbackResult,
      message: rollbackResult.message,
    });
  });

  // Webhook: GitHub Actions incoming build notification (standby slot ready for approval)
  fastify.post<{ Body: WebhookBody }>('/webhook', async (request, reply) => {
    const body = request.body || {};
    const currentRouting = await caddyService.getRoutingState();
    // Standby slot is the opposite of the current active slot
    const targetSlot: DeploymentSlot = currentRouting.activeSlot === 'blue' ? 'green' : 'blue';

    const record = await DeploymentModel.create({
      projectName: body.projectName || 'ivandestefani-hub',
      repository: body.repository || 'ivandestefani/new-hub',
      branch: body.branch || 'main',
      commitHash: body.commitHash || 'c0ffee1',
      commitMessage: body.commitMessage || 'Automated CI build from GitHub Actions',
      imageTag: body.imageTag || `hub:${targetSlot}-latest`,
      slot: targetSlot,
      status: 'pending_approval',
      upstreamUrl: targetSlot === 'blue' ? currentRouting.blueUpstream : currentRouting.greenUpstream,
      deployedAt: new Date().toISOString(),
    });

    return reply.status(201).send({
      success: true,
      data: record,
      message: `Build registered on slot ${targetSlot.toUpperCase()}. Awaiting Admin approval for traffic switch.`,
    });
  });
}

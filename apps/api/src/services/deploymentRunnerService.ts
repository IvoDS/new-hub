import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { DeploymentSlot, DeploymentStage, DeploymentJobStatus } from '@hub/shared';
import { caddyService } from './caddyService.js';
import { DeploymentModel } from '../models/DeploymentModel.js';
import { env } from '../config/env.js';

export interface TriggerOptions {
  targetSlot: DeploymentSlot;
  autoSwitch: boolean;
  approvedBy?: string;
}

class DeploymentRunnerService {
  private activeJobId: string | null = null;
  private isRunning: boolean = false;
  private stage: DeploymentStage = 'idle';
  private targetSlot: DeploymentSlot | null = null;
  private autoSwitch: boolean = false;
  private startedAt: string | null = null;
  private finishedAt: string | null = null;
  private error: string | null = null;
  private logs: string[] = [];

  public getStatus(): DeploymentJobStatus {
    return {
      activeJobId: this.activeJobId,
      isRunning: this.isRunning,
      stage: this.stage,
      targetSlot: this.targetSlot,
      autoSwitch: this.autoSwitch,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      error: this.error,
      logs: [...this.logs],
    };
  }

  private addLog(message: string): void {
    const timestamp = new Date().toTimeString().split(' ')[0];
    const line = `[${timestamp}] ${message}`;
    this.logs.push(line);
    if (this.logs.length > 250) {
      this.logs.shift();
    }
    console.log(`[DEPLOY-RUNNER] ${message}`);
  }

  public async triggerDeploy(options: TriggerOptions): Promise<{ jobId: string; targetSlot: DeploymentSlot; autoSwitch: boolean }> {
    if (this.isRunning) {
      throw new Error('A deployment job is already running. Please wait for it to finish.');
    }

    const jobId = Math.random().toString(36).substring(2, 10);
    this.activeJobId = jobId;
    this.isRunning = true;
    this.stage = 'queued';
    this.targetSlot = options.targetSlot;
    this.autoSwitch = options.autoSwitch;
    this.startedAt = new Date().toISOString();
    this.finishedAt = null;
    this.error = null;
    this.logs = [];

    this.addLog(`Deployment #${jobId} queued. Target slot: ${options.targetSlot.toUpperCase()} (Auto-switch: ${options.autoSwitch})`);

    // Execute asynchronously without blocking the REST response
    setImmediate(() => {
      this.executePipeline(options).catch((err) => {
        this.stage = 'failed';
        this.isRunning = false;
        this.error = err.message || String(err);
        this.finishedAt = new Date().toISOString();
        this.addLog(`FATAL: Deployment pipeline failed: ${this.error}`);
      });
    });

    return {
      jobId,
      targetSlot: options.targetSlot,
      autoSwitch: options.autoSwitch,
    };
  }

  private async executePipeline(options: TriggerOptions): Promise<void> {
    const { targetSlot, autoSwitch, approvedBy } = options;
    const targetPort = targetSlot === 'blue' ? '3001' : '3002';
    const targetUpstream = targetSlot === 'blue' ? env.CADDY_BLUE_UPSTREAM : env.CADDY_GREEN_UPSTREAM;

    let commitHash = 'latest';
    let commitMessage = 'Single-button deploy triggered via Admin Hub';

    // 1. Resolve repository directory
    let repoDir = env.REPO_DIR;
    if (!fs.existsSync(repoDir)) {
      // Fallback search candidates
      const candidates = [
        path.resolve(process.cwd(), '../..'),
        '/opt/new-hub',
        '/opt/ivandestefani-hub',
        process.cwd(),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand) && fs.existsSync(path.join(cand, 'package.json'))) {
          repoDir = cand;
          break;
        }
      }
    }
    this.addLog(`Using repository root directory: ${repoDir}`);

    // Test environment simulation
    if (process.env.NODE_ENV === 'test') {
      this.stage = 'pulling';
      this.addLog('[TEST MODE] Simulating git pull origin main...');
      await new Promise((r) => setTimeout(r, 50));
      commitHash = 'test-c0ffee1';
      commitMessage = 'Test automated deployment run';

      this.stage = 'building';
      this.addLog(`[TEST MODE] Simulating docker compose build web-${targetSlot}...`);
      await new Promise((r) => setTimeout(r, 50));

      this.stage = 'healthchecking';
      this.addLog(`[TEST MODE] Simulating container startup & health check on port ${targetPort}...`);
      await new Promise((r) => setTimeout(r, 50));

      if (autoSwitch) {
        this.stage = 'switching';
        this.addLog(`[TEST MODE] Auto-switching traffic to ${targetSlot.toUpperCase()}...`);
        await caddyService.switchTraffic(targetSlot);
      }

      await DeploymentModel.create({
        projectName: 'ivandestefani-hub',
        repository: 'IvoDS/new-hub',
        branch: 'main',
        commitHash,
        commitMessage,
        imageTag: `hub-web:latest-${targetSlot}`,
        slot: targetSlot,
        status: autoSwitch ? 'active' : 'pending_approval',
        upstreamUrl: targetUpstream,
        deployedAt: new Date().toISOString(),
        activatedAt: autoSwitch ? new Date().toISOString() : undefined,
        approvedBy: approvedBy || 'Admin',
      });

      this.stage = 'completed';
      this.isRunning = false;
      this.finishedAt = new Date().toISOString();
      this.addLog('[TEST MODE] Deployment finished successfully!');
      return;
    }

    // 2. Stage: pulling (Git pull origin main)
    this.stage = 'pulling';
    this.addLog(`Fetching latest commits from GitHub (origin/main)...`);

    try {
      await this.runProcess('git', ['fetch', 'origin', 'main'], repoDir);
      await this.runProcess('git', ['reset', '--hard', 'origin/main'], repoDir);

      const hashRes = await this.runProcess('git', ['rev-parse', '--short', 'HEAD'], repoDir);
      if (hashRes.stdout) commitHash = hashRes.stdout.trim();

      const msgRes = await this.runProcess('git', ['log', '-1', '--pretty=%B'], repoDir);
      if (msgRes.stdout) commitMessage = msgRes.stdout.trim().split('\n')[0];

      this.addLog(`Successfully updated to commit: [${commitHash}] "${commitMessage}"`);
    } catch (err: any) {
      this.addLog(`Git pull notice: ${err.message || err}. Proceeding with existing source files.`);
    }

    // 3. Stage: building (Docker compose build web-slot)
    this.stage = 'building';
    this.addLog(`Compiling Next.js container 'hub-web:latest' for standby slot ${targetSlot.toUpperCase()}...`);

    const composeFile = path.join(repoDir, 'docker', 'docker-compose.prod.yml');
    const composeExists = fs.existsSync(composeFile);

    if (composeExists) {
      await this.runProcess(
        'docker',
        ['compose', '-f', composeFile, 'build', `web-${targetSlot}`],
        repoDir
      );
      this.addLog(`Container image build completed successfully.`);
    } else {
      this.addLog(`Warning: docker-compose.prod.yml not found at ${composeFile}. Skipping docker build step.`);
    }

    // 4. Stage: healthchecking (Recreate container & verify uptime)
    this.stage = 'healthchecking';
    this.addLog(`Recreating container 'hub-web-${targetSlot}'...`);

    if (composeExists) {
      await this.runProcess(
        'docker',
        ['compose', '-f', composeFile, 'up', '-d', '--no-deps', `web-${targetSlot}`],
        repoDir
      );
    }

    this.addLog(`Verifying health on upstream http://127.0.0.1:${targetPort}...`);
    const healthy = await this.pollHealthCheck(targetPort, 35, 2000);

    if (!healthy) {
      throw new Error(`Standby container failed healthcheck on port ${targetPort} after 70 seconds.`);
    }
    this.addLog(`Standby container is online and healthy!`);

    // 5. Stage: switching (if autoSwitch was selected)
    if (autoSwitch) {
      this.stage = 'switching';
      this.addLog(`Auto-switch enabled: Switching live Caddy reverse proxy to slot ${targetSlot.toUpperCase()}...`);
      const switchResult = await caddyService.switchTraffic(targetSlot);
      this.addLog(`Caddy traffic switched: ${switchResult.message}`);
    } else {
      this.addLog(`Standby slot ${targetSlot.toUpperCase()} is ready! Waiting for manual Admin traffic promotion.`);
    }

    // 6. Record in Database
    await DeploymentModel.create({
      projectName: 'ivandestefani-hub',
      repository: 'IvoDS/new-hub',
      branch: 'main',
      commitHash,
      commitMessage,
      imageTag: `hub-web:latest-${targetSlot}`,
      slot: targetSlot,
      status: autoSwitch ? 'active' : 'pending_approval',
      upstreamUrl: targetUpstream,
      deployedAt: new Date().toISOString(),
      activatedAt: autoSwitch ? new Date().toISOString() : undefined,
      approvedBy: approvedBy || 'Ivan De Stefani',
    });

    // 7. Complete
    this.stage = 'completed';
    this.isRunning = false;
    this.finishedAt = new Date().toISOString();
    this.addLog(`Deployment #${this.activeJobId} completed successfully!`);
  }

  private async pollHealthCheck(port: string, maxAttempts = 30, delayMs = 2000): Promise<boolean> {
    const url = `http://127.0.0.1:${port}`;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(url, { signal: controller.signal }).catch(() => null);
        clearTimeout(timeout);

        if (res && (res.status === 200 || res.status === 307 || res.status === 308)) {
          this.addLog(`Healthcheck passed on attempt ${attempt} (HTTP ${res.status}).`);
          return true;
        }
      } catch {
        // ignore and retry
      }
      this.addLog(`Waiting for container to warm up (attempt ${attempt}/${maxAttempts})...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
  }

  private runProcess(cmd: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      this.addLog(`$ ${cmd} ${args.join(' ')}`);
      const child = spawn(cmd, args, { cwd, shell: false });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (line.trim()) this.addLog(line.trim());
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (line.trim()) this.addLog(line.trim());
        }
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command '${cmd} ${args.join(' ')}' exited with code ${code}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
  }
}

export const deploymentRunnerService = new DeploymentRunnerService();

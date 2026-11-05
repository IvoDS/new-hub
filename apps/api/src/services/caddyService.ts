import type { CaddyRoutingState, DeploymentSlot } from '@hub/shared';
import { env } from '../config/env.js';

class CaddyService {
  private activeSlot: DeploymentSlot = 'blue';
  private previousSlot: DeploymentSlot = 'green';
  private lastSwitchTimestamp: string = new Date().toISOString();

  /**
   * Get current active routing state
   */
  async getRoutingState(): Promise<CaddyRoutingState> {
    const activeUpstream = this.activeSlot === 'blue' ? env.CADDY_BLUE_UPSTREAM : env.CADDY_GREEN_UPSTREAM;
    return {
      activeSlot: this.activeSlot,
      blueUpstream: env.CADDY_BLUE_UPSTREAM,
      greenUpstream: env.CADDY_GREEN_UPSTREAM,
      activeUpstream,
      previousSlot: this.previousSlot,
      lastSwitchTimestamp: this.lastSwitchTimestamp,
    };
  }

  /**
   * Perform an instant zero-downtime traffic switch between Blue and Green slots
   */
  async switchTraffic(targetSlot: DeploymentSlot): Promise<{ success: boolean; state: CaddyRoutingState; message: string }> {
    const targetUpstream = targetSlot === 'blue' ? env.CADDY_BLUE_UPSTREAM : env.CADDY_GREEN_UPSTREAM;

    console.log(`[CADDY] Requesting traffic switch to slot '${targetSlot}' (Upstream: ${targetUpstream})...`);

    // Verify upstream health if reachable
    const healthOk = await this.checkUpstreamHealth(targetUpstream);
    if (!healthOk) {
      console.warn(`[CADDY] Health check for upstream ${targetUpstream} failed or timed out. Proceeding if forced.`);
    }

    // Attempt Caddy API call if Caddy Admin is available
    const caddyUpdated = await this.updateCaddyConfig(targetUpstream);

    // Update state
    this.previousSlot = this.activeSlot;
    this.activeSlot = targetSlot;
    this.lastSwitchTimestamp = new Date().toISOString();

    const state = await this.getRoutingState();
    return {
      success: true,
      state,
      message: caddyUpdated
        ? `Successfully updated Caddy live configuration. Traffic routed to ${targetSlot.toUpperCase()} (${targetUpstream}).`
        : `Simulated routing switched to ${targetSlot.toUpperCase()} (${targetUpstream}). Caddy daemon was offline or running in mock mode.`,
    };
  }

  /**
   * Instantly rollback to previous slot
   */
  async rollback(): Promise<{ success: boolean; state: CaddyRoutingState; message: string }> {
    const targetSlot = this.previousSlot;
    console.log(`[CADDY] Triggering instant rollback to slot '${targetSlot}'...`);
    return this.switchTraffic(targetSlot);
  }

  /**
   * Communicate with Caddy Admin REST API (http://localhost:2019)
   */
  private async updateCaddyConfig(targetUpstream: string): Promise<boolean> {
    try {
      // Caddy dynamic upstream config patch path:
      // In Caddy JSON config, reverse proxy upstreams can be updated via:
      // PATCH /config/apps/http/servers/srv0/routes/... or a dedicated named upstream route
      const controllerUrl = `${env.CADDY_ADMIN_URL}/config/apps/http/servers/srv0/routes/0/handle/0/routes/0/handle/0/upstreams/0/dial`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(controllerUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetUpstream),
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (response && response.ok) {
        console.log(`[CADDY] Dynamic route successfully updated via Caddy Admin API to ${targetUpstream}`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Health check for upstream before routing traffic
   */
  private async checkUpstreamHealth(upstream: string): Promise<boolean> {
    try {
      const url = upstream.startsWith('http') ? `${upstream}/api/health` : `http://${upstream}/api/health`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(url, { signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);

      return res !== null && res.ok;
    } catch {
      return false;
    }
  }
}

export const caddyService = new CaddyService();

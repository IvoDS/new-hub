export type DeploymentSlot = 'blue' | 'green';

export type DeploymentStatus = 
  | 'building'
  | 'pending_approval'
  | 'active'
  | 'idle'
  | 'rolled_back'
  | 'failed';

export interface DeploymentRecord {
  id: string;
  projectName: string;
  repository: string;
  branch: string;
  commitHash: string;
  commitMessage: string;
  imageTag: string;
  slot: DeploymentSlot;
  status: DeploymentStatus;
  upstreamUrl: string;
  deployedAt: string;
  activatedAt?: string;
  approvedBy?: string;
}

export interface CaddyRoutingState {
  activeSlot: DeploymentSlot;
  blueUpstream: string;
  greenUpstream: string;
  activeUpstream: string;
  lastSwitchTimestamp: string;
  previousSlot?: DeploymentSlot;
}

export interface SwitchSlotRequest {
  targetSlot: DeploymentSlot;
  notes?: string;
}

export interface RollbackRequest {
  reason?: string;
}

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

export type DeploymentStage =
  | 'idle'
  | 'queued'
  | 'pulling'
  | 'building'
  | 'healthchecking'
  | 'switching'
  | 'completed'
  | 'failed';

export interface TriggerDeployRequest {
  targetSlot?: DeploymentSlot;
  autoSwitch?: boolean;
}

export interface DeploymentJobStatus {
  activeJobId: string | null;
  isRunning: boolean;
  stage: DeploymentStage;
  targetSlot: DeploymentSlot | null;
  autoSwitch: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  logs: string[];
}

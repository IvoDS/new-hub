import { DataTypes, Model, Optional } from 'sequelize';
import type { DeploymentRecord, DeploymentSlot, DeploymentStatus } from '@hub/shared';
import { initSequelize } from '../config/database.js';

interface DeploymentCreationAttributes extends Optional<DeploymentRecord, 'id' | 'deployedAt' | 'activatedAt' | 'approvedBy'> {}

export class DeploymentModel extends Model<DeploymentRecord, DeploymentCreationAttributes> implements DeploymentRecord {
  declare id: string;
  declare projectName: string;
  declare repository: string;
  declare branch: string;
  declare commitHash: string;
  declare commitMessage: string;
  declare imageTag: string;
  declare slot: DeploymentSlot;
  declare status: DeploymentStatus;
  declare upstreamUrl: string;
  declare deployedAt: string;
  declare activatedAt?: string;
  declare approvedBy?: string;
}

export function initDeploymentModel() {
  const sequelize = initSequelize();
  DeploymentModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      projectName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      repository: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      commitHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      commitMessage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imageTag: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slot: {
        type: DataTypes.ENUM('blue', 'green'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('building', 'pending_approval', 'active', 'idle', 'rolled_back', 'failed'),
        allowNull: false,
        defaultValue: 'pending_approval',
      },
      upstreamUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deployedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      activatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approvedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'deployments',
      timestamps: false,
    }
  );
  return DeploymentModel;
}

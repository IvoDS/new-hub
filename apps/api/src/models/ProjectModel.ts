import { DataTypes, Model, Optional } from 'sequelize';
import type { Project, CreateProjectInput } from '@hub/shared';
import { initSequelize } from '../config/database.js';

interface ProjectCreationAttributes extends Optional<Project, 'id' | 'createdAt' | 'updatedAt' | 'featured' | 'order' | 'published'> {}

export class ProjectModel extends Model<Project, ProjectCreationAttributes> implements Project {
  declare id: string;
  declare title: string;
  declare slug: string;
  declare summary: string;
  declare description: string;
  declare category: 'web' | 'mobile' | 'ai' | 'cloud' | 'tooling';
  declare tags: string[];
  declare coverImageUrl?: string;
  declare demoUrl?: string;
  declare githubUrl?: string;
  declare featured: boolean;
  declare order: number;
  declare published: boolean;
  declare readonly createdAt: string;
  declare readonly updatedAt: string;
}

export function initProjectModel() {
  const sequelize = initSequelize();
  ProjectModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      summary: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM('web', 'mobile', 'ai', 'cloud', 'tooling'),
        allowNull: false,
        defaultValue: 'web',
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      coverImageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      demoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      githubUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      published: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'projects',
      timestamps: true,
    }
  );
  return ProjectModel;
}

import { DataTypes, Model, Optional } from 'sequelize';
import type { Profile, SocialLink } from '@hub/shared';
import { initSequelize } from '../config/database.js';

interface ProfileCreationAttributes extends Optional<Profile, 'id' | 'updatedAt'> {}

export class ProfileModel extends Model<Profile, ProfileCreationAttributes> implements Profile {
  declare id: string;
  declare fullName: string;
  declare headline: string;
  declare bio: string;
  declare avatarUrl?: string;
  declare cvPdfUrl?: string;
  declare location: string;
  declare email: string;
  declare socialLinks: SocialLink[];
  declare skills: { category: string; items: string[] }[];
  declare readonly updatedAt: string;
}

export function initProfileModel() {
  const sequelize = initSequelize();
  ProfileModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      headline: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cvPdfUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      socialLinks: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      skills: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'profile',
      timestamps: true,
      createdAt: false,
    }
  );
  return ProfileModel;
}

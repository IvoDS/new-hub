import { DataTypes, Model, Optional } from 'sequelize';
import type { SiteContent, SiteHeroText, CompetencySection } from '@hub/shared';
import { initSequelize } from '../config/database.js';

interface SiteContentCreationAttributes extends Optional<SiteContent, 'id' | 'updatedAt'> {}

export class SiteContentModel extends Model<SiteContent, SiteContentCreationAttributes> implements SiteContent {
  declare id: string;
  declare hero: SiteHeroText;
  declare competencies: CompetencySection[];
  declare readonly updatedAt: string;
}

export function initSiteContentModel() {
  const sequelize = initSequelize();
  SiteContentModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      hero: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      competencies: {
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
      tableName: 'site_content',
      timestamps: true,
      createdAt: false,
    }
  );
  return SiteContentModel;
}

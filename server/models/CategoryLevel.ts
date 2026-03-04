import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class CategoryLevel extends Model {
  declare id: string;
  declare categoryId: string;
  declare levelId: string;
}

CategoryLevel.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Categories', key: 'id' },
    onDelete: 'CASCADE',
  },
  levelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Levels', key: 'id' },
    onDelete: 'CASCADE',
  },
}, {
  sequelize,
  modelName: 'CategoryLevel',
  indexes: [
    { unique: true, fields: ['categoryId', 'levelId'] },
  ],
});

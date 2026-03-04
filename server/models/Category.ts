import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Category extends Model {
  declare id: string;
  declare name: string;
  declare description: string;
  declare icon: string;
  declare rulesUrl: string | null;
  declare order: number;
  declare isActive: boolean;
  declare Levels?: any[];
}

Category.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Gamepad2',
  },
  rulesUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'Category',
});

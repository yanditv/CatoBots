import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Level extends Model {
  declare id: string;
  declare name: string;
  declare description: string;
  declare icon: string;
  declare order: number;
  declare isActive: boolean;
}

Level.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Bot',
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
  modelName: 'Level',
});

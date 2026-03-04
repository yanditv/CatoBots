import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class EventConfig extends Model {
  declare id: string;
  declare key: string;
  declare value: string;
  declare label: string;
  declare group: string;
}

EventConfig.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  group: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'general',
  },
}, {
  sequelize,
  modelName: 'EventConfig',
});

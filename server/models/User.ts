import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class User extends Model {
  declare id: string;
  declare username: string;
  declare password: string;
  declare role: 'ADMIN' | 'REFEREE';
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'REFEREE'),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'User',
});

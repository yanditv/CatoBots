import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

export class Sponsor extends Model {
  declare id: string;
  declare name: string;
  declare logoUrl: string;
  declare website: string;
  declare tier: 'GOLD' | 'SILVER' | 'BRONZE';
}

Sponsor.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tier: {
    type: DataTypes.ENUM('GOLD', 'SILVER', 'BRONZE'),
    defaultValue: 'BRONZE',
  },
}, {
  sequelize,
  modelName: 'Sponsor',
});

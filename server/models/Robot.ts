import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import { Institution } from './Institution';

export class Robot extends Model {
  declare id: string;
  declare name: string;
  declare level: 'JUNIOR' | 'SENIOR' | 'MASTER';
  declare category: string;
  declare isHomologated: boolean;
  declare institutionId: string;
}

Robot.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'JUNIOR',
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Minisumo Autónomo',
  },
  isHomologated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'Robot',
});

Robot.belongsTo(Institution, { foreignKey: 'institutionId' });
Institution.hasOne(Robot, { foreignKey: 'institutionId' });

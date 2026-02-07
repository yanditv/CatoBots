import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import { Institution } from './Institution';

export class Robot extends Model {
  declare id: string;
  declare name: string;
  declare weightClass: string;
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
  weightClass: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Robot',
});

Robot.belongsTo(Institution, { foreignKey: 'institutionId' });
Institution.hasOne(Robot, { foreignKey: 'institutionId' });

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Institution extends Model {
  declare id: string;
  declare name: string;
  declare contactEmail: string;
  declare isPaid: boolean;
  declare members: string[];
}

Institution.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  members: {
    type: DataTypes.JSON, // Stores array of 2 strings
    allowNull: false,
    defaultValue: [],
  },
}, {
  sequelize,
  modelName: 'Institution',
});

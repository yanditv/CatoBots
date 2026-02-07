import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Institution extends Model {
  declare id: string;
  declare name: string;
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
  members: {
    type: DataTypes.JSON, // Stores array of 2 strings
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Institution',
});

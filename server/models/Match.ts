import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import { Robot } from './Robot';
import { User } from './User';

export class Match extends Model {
  declare id: string;
  declare robotAId: string;
  declare robotBId: string;
  declare scoreA: number;
  declare scoreB: number;
  declare penaltiesA: string[];
  declare penaltiesB: string[];
  declare timeLeft: number;
  declare isActive: boolean;
  declare category: string;
  declare refereeId: string;
}

Match.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  scoreA: { type: DataTypes.INTEGER, defaultValue: 0 },
  scoreB: { type: DataTypes.INTEGER, defaultValue: 0 },
  penaltiesA: { type: DataTypes.JSON, defaultValue: [] },
  penaltiesB: { type: DataTypes.JSON, defaultValue: [] },
  timeLeft: { type: DataTypes.INTEGER, defaultValue: 180 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  category: { type: DataTypes.STRING, allowNull: false },
}, {
  sequelize,
  modelName: 'Match',
});

Match.belongsTo(Robot, { as: 'robotA', foreignKey: 'robotAId' });
Match.belongsTo(Robot, { as: 'robotB', foreignKey: 'robotBId' });
Match.belongsTo(User, { as: 'referee', foreignKey: 'refereeId' });

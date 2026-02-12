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
  declare isFinished: boolean;
  declare category: string;
  declare level: 'JUNIOR' | 'SENIOR' | 'MASTER' | null;
  declare refereeId: string;
  declare round: string;
  declare winnerId: string;
  declare nextMatchId: string | null;
  declare positionInNextMatch: 'A' | 'B' | null;
  declare showInDashboard: boolean;
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
  isFinished: { type: DataTypes.BOOLEAN, defaultValue: false },
  category: { type: DataTypes.STRING, allowNull: false },
  level: { type: DataTypes.STRING, allowNull: true },
  round: { type: DataTypes.STRING, defaultValue: 'QUARTERS' },
  winnerId: { type: DataTypes.UUID, allowNull: true },
  nextMatchId: { type: DataTypes.UUID, allowNull: true },
  positionInNextMatch: { type: DataTypes.STRING, allowNull: true },
  showInDashboard: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  sequelize,
  modelName: 'Match',
});

Match.belongsTo(Robot, { as: 'robotA', foreignKey: 'robotAId' });
Match.belongsTo(Robot, { as: 'robotB', foreignKey: 'robotBId' });
Match.belongsTo(User, { as: 'referee', foreignKey: 'refereeId' });

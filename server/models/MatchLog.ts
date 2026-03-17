import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import { Match } from './Match';
import { Robot } from './Robot';

export class MatchLog extends Model {
  declare id: string;
  declare matchId: string;
  declare robotId: string | null;
  declare type: 'POINT' | 'PENALTY' | 'TIMER' | 'STATE_CHANGE' | 'SYSTEM_EVENT';
  declare action: string;
  declare description: string;
  declare points: number;
  declare matchTime: number; // The match clock value at the moment of the event
  declare metadata: any;
}

MatchLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  matchId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  robotId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  matchTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'MatchLog',
});

MatchLog.belongsTo(Match, { foreignKey: 'matchId' });
Match.hasMany(MatchLog, { foreignKey: 'matchId', as: 'logs' });

MatchLog.belongsTo(Robot, { foreignKey: 'robotId' });

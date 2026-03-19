import { DataTypes } from 'sequelize';

export const BaseMatchFields = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  scoreA: { type: DataTypes.INTEGER, defaultValue: 0 },
  scoreB: { type: DataTypes.INTEGER, defaultValue: 0 },
  penaltiesA: { type: DataTypes.JSON, defaultValue: [] },
  penaltiesB: { type: DataTypes.JSON, defaultValue: [] },
  roundWinners: { type: DataTypes.JSON, defaultValue: [] },
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
};

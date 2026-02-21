"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const Robot_1 = require("./Robot");
const User_1 = require("./User");
class Match extends sequelize_1.Model {
}
exports.Match = Match;
Match.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    scoreA: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
    scoreB: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
    penaltiesA: { type: sequelize_1.DataTypes.JSON, defaultValue: [] },
    penaltiesB: { type: sequelize_1.DataTypes.JSON, defaultValue: [] },
    timeLeft: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 180 },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
    isFinished: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
    category: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    level: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    round: { type: sequelize_1.DataTypes.STRING, defaultValue: 'QUARTERS' },
    winnerId: { type: sequelize_1.DataTypes.UUID, allowNull: true },
    nextMatchId: { type: sequelize_1.DataTypes.UUID, allowNull: true },
    positionInNextMatch: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    showInDashboard: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize: db_1.default,
    modelName: 'Match',
});
Match.belongsTo(Robot_1.Robot, { as: 'robotA', foreignKey: 'robotAId' });
Match.belongsTo(Robot_1.Robot, { as: 'robotB', foreignKey: 'robotBId' });
Match.belongsTo(User_1.User, { as: 'referee', foreignKey: 'refereeId' });

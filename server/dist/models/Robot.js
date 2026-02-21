"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Robot = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const Institution_1 = require("./Institution");
class Robot extends sequelize_1.Model {
}
exports.Robot = Robot;
Robot.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    level: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'JUNIOR',
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Minisumo Autónomo',
    },
    isHomologated: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Robot',
});
Robot.belongsTo(Institution_1.Institution, { foreignKey: 'institutionId' });
Institution_1.Institution.hasOne(Robot, { foreignKey: 'institutionId' });

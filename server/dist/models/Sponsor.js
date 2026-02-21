"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sponsor = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Sponsor extends sequelize_1.Model {
}
exports.Sponsor = Sponsor;
Sponsor.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    logoUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    website: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    tier: {
        type: sequelize_1.DataTypes.ENUM('GOLD', 'SILVER', 'BRONZE'),
        defaultValue: 'BRONZE',
    },
}, {
    sequelize: db_1.default,
    modelName: 'Sponsor',
});

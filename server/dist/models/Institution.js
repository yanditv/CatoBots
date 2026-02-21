"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Institution = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Institution extends sequelize_1.Model {
}
exports.Institution = Institution;
Institution.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    contactEmail: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isPaid: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    members: {
        type: sequelize_1.DataTypes.JSON, // Stores array of 2 strings
        allowNull: false,
        defaultValue: [],
    },
}, {
    sequelize: db_1.default,
    modelName: 'Institution',
});

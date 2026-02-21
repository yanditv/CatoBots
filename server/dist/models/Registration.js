"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registration = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Registration extends sequelize_1.Model {
}
exports.Registration = Registration;
Registration.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    google_email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        // Add index for fast lookups? handled by DB usually, but we could add index: true
    },
    step: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 1,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('DRAFT', 'SUBMITTED'),
        defaultValue: 'DRAFT',
    },
    data: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    payment_proof_filename: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isPaid: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING',
    }
}, {
    sequelize: db_1.default,
    modelName: 'Registration',
    tableName: 'Registrations',
    indexes: [
        {
            unique: false,
            fields: ['google_email']
        }
    ]
});

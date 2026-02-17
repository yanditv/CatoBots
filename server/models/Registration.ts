import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Registration extends Model {
    declare id: string;
    declare google_email: string; // The user who owns this draft
    declare step: number;         // Current step (1-5)
    declare status: 'DRAFT' | 'SUBMITTED';
    declare data: any;            // JSON payload of form state
    declare payment_proof_filename: string | null;
    declare isPaid: boolean;
    declare paymentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

Registration.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    google_email: {
        type: DataTypes.STRING,
        allowNull: false,
        // Add index for fast lookups? handled by DB usually, but we could add index: true
    },
    step: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'SUBMITTED'),
        defaultValue: 'DRAFT',
    },
    data: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    payment_proof_filename: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    paymentStatus: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING',
    }
}, {
    sequelize,
    modelName: 'Registration',
    tableName: 'Registrations',
    indexes: [
        {
            unique: false,
            fields: ['google_email']
        }
    ]
});

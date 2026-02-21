import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST || process.env.DATABASE_URL || 'db';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'cato_bots',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || 'password',
  {
    host: dbHost,
    dialect: 'mysql',
    logging: false,
    retry: {
      max: 5,
      match: [
        /SequelizeConnectionError/,
        /ConnectionError/,
        /EAI_AGAIN/,
        /ECONNREFUSED/
      ]
    }
  }
);

export default sequelize;

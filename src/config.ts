import dotenv from 'dotenv';
import { SERVER_ENVIRONMENT } from './types';
dotenv.config();

export default {
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  REDIS_URL: process.env.REDIS_URL || '',
  ENVIRONMENT: process.env.ENVIRONMENT || SERVER_ENVIRONMENT.DEV,
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || '8080',
};

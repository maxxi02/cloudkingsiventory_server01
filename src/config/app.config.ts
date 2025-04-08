import { getEnv } from '../common/utils/get-env';

const appConfig = () => ({
  APP_ORIGIN: getEnv('APP_ORIGIN', 'localhost'),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnv('PORT', '7777'),
  BASE_PATH: getEnv('BASE_PATH', '/api'),
  MONGO_URI: getEnv('MONGO_URI'),
  JWT: {
    SECRET: getEnv('JWT_SECRET'),
    EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '15'),
    REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
    REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN'),
  },
  MAILER_SENDER: getEnv('MAILER_SENDER'),
  RESEND_API_KEY: getEnv('RESEND_API_KEY'),
});

export const config = appConfig();

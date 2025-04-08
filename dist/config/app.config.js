"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const get_env_1 = require("../common/utils/get-env");
const appConfig = () => ({
    APP_ORIGIN: (0, get_env_1.getEnv)('APP_ORIGIN', 'localhost'),
    NODE_ENV: (0, get_env_1.getEnv)('NODE_ENV', 'development'),
    PORT: (0, get_env_1.getEnv)('PORT', '7777'),
    BASE_PATH: (0, get_env_1.getEnv)('BASE_PATH', '/api'),
    MONGO_URI: (0, get_env_1.getEnv)('MONGO_URI'),
    JWT: {
        SECRET: (0, get_env_1.getEnv)('JWT_SECRET'),
        EXPIRES_IN: (0, get_env_1.getEnv)('JWT_EXPIRES_IN', '15'),
        REFRESH_SECRET: (0, get_env_1.getEnv)('JWT_REFRESH_SECRET'),
        REFRESH_EXPIRES_IN: (0, get_env_1.getEnv)('JWT_REFRESH_EXPIRES_IN'),
    },
    MAILER_SENDER: (0, get_env_1.getEnv)('MAILER_SENDER'),
    RESEND_API_KEY: (0, get_env_1.getEnv)('RESEND_API_KEY'),
});
exports.config = appConfig();

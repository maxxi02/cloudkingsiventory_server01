"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
require("winston-daily-rotate-file");
const app_config_1 = require("../../config/app.config");
// Define log format
const logFormat = winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
}));
// Create logger instance
exports.logger = (0, winston_1.createLogger)({
    level: app_config_1.config.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.DailyRotateFile({
            dirname: 'logs',
            filename: '%DATE%-app.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
});

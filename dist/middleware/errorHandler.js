"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const http_config_1 = require("../config/http.config");
const app_error_1 = require("../common/utils/app-error");
const cookie_1 = require("../common/utils/cookie");
const formatZodError = (res, error) => {
    const errors = error?.issues?.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
    return res
        .status(http_config_1.HTTPSTATUS.BAD_REQUEST)
        .json({ message: 'Validation failed', error: errors });
};
// error handler
const errorHandler = (error, req, res, next) => {
    console.error(`Error occured on PATH: ${req.path}`, error);
    if (req.path === cookie_1.REFRESH_PATH) {
        (0, cookie_1.clearAuthenticationCookies)(res);
    }
    if (error instanceof SyntaxError) {
        return res.status(http_config_1.HTTPSTATUS.BAD_REQUEST).json({
            message: 'Invalid JSON format, please check your request body',
        });
    }
    if (error instanceof app_error_1.AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
            errorCode: error.errorCode,
        });
    }
    if (error instanceof zod_1.z.ZodError) {
        return formatZodError(res, error);
    }
    return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error',
        error: error?.message || 'Unknown error occurred',
    });
};
exports.default = errorHandler;

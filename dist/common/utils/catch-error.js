"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = exports.InternalServerError = exports.UnauthorizedException = exports.BadRequestException = exports.NotFoundException = void 0;
const http_config_1 = require("../../config/http.config");
const app_error_1 = require("./app-error");
class NotFoundException extends app_error_1.AppError {
    constructor(message = 'Request not found', errorCode) {
        super(message, http_config_1.HTTPSTATUS.NOT_FOUND, errorCode || "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
    }
}
exports.NotFoundException = NotFoundException;
class BadRequestException extends app_error_1.AppError {
    constructor(message = 'Bad Request', errorCode) {
        super(message, http_config_1.HTTPSTATUS.BAD_REQUEST, errorCode || "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends app_error_1.AppError {
    constructor(message = 'Unauthorized Access', errorCode) {
        super(message, http_config_1.HTTPSTATUS.UNAUTHORIZED, errorCode || "ACCESS_UNAUTHORIZED" /* ErrorCode.ACCESS_UNAUTHORIZED */);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class InternalServerError extends app_error_1.AppError {
    constructor(message = 'Internal Server Error', errorCode) {
        super(message, http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode || "INTERNAL_SERVER_ERROR" /* ErrorCode.INTERNAL_SERVER_ERROR */);
    }
}
exports.InternalServerError = InternalServerError;
class HttpException extends app_error_1.AppError {
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}
exports.HttpException = HttpException;

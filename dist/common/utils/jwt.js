"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwtToken = exports.signJwtToken = exports.refreshTokenSignOptions = exports.accessTokenSignOptions = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_config_1 = require("../../config/app.config");
const accessTokenExpiresIn = 15 * 60; // 15 minutes
const refreshTokenExpiresIn = 7 * 24 * 60 * 60; // 7 days
const defaults = {
    audience: ['user'],
};
exports.accessTokenSignOptions = {
    expiresIn: accessTokenExpiresIn,
    secret: app_config_1.config.JWT.SECRET,
};
exports.refreshTokenSignOptions = {
    expiresIn: refreshTokenExpiresIn,
    secret: app_config_1.config.JWT.REFRESH_SECRET,
};
const signJwtToken = (payload, options) => {
    const { secret, ...opts } = options || exports.accessTokenSignOptions;
    return jsonwebtoken_1.default.sign(payload, secret, {
        ...defaults,
        ...opts,
    });
};
exports.signJwtToken = signJwtToken;
const verifyJwtToken = (token, options) => {
    try {
        const { secret = app_config_1.config.JWT.SECRET, ...opts } = options || {};
        const payload = jsonwebtoken_1.default.verify(token, secret, {
            ...defaults,
            ...opts,
        });
        return { payload };
    }
    catch (error) {
        return { error: error.message };
    }
};
exports.verifyJwtToken = verifyJwtToken;

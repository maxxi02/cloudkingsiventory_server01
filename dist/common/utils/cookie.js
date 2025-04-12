"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthenticationCookies = exports.setAuthenticationCookies = exports.getAccessTokenCookieOptions = exports.getRefreshTokenCookieOptions = exports.REFRESH_PATH = void 0;
const app_config_1 = require("../../config/app.config");
const date_time_1 = require("./date-time");
exports.REFRESH_PATH = `${app_config_1.config.BASE_PATH}/auth/refresh`;
const defaults = {
    httpOnly: true,
    secure: app_config_1.config.NODE_ENV === 'production' ? true : false,
    sameSite: 'none',
    domain: 'cloudkingsiventory-server01.onrender.com',
};
const getRefreshTokenCookieOptions = () => {
    const expiresIn = app_config_1.config.JWT.REFRESH_EXPIRES_IN;
    const expires = (0, date_time_1.calculateExpirationDate)(expiresIn);
    return {
        ...defaults,
        expires,
        path: exports.REFRESH_PATH,
    };
};
exports.getRefreshTokenCookieOptions = getRefreshTokenCookieOptions;
const getAccessTokenCookieOptions = () => {
    const expiresIn = app_config_1.config.JWT.EXPIRES_IN;
    const expires = (0, date_time_1.calculateExpirationDate)(expiresIn);
    return {
        ...defaults,
        expires,
        path: '/',
    };
};
exports.getAccessTokenCookieOptions = getAccessTokenCookieOptions;
const setAuthenticationCookies = ({ res, accessToken, refreshToken, }) => res
    .cookie('accessToken', accessToken, (0, exports.getAccessTokenCookieOptions)())
    .cookie('refreshToken', refreshToken, (0, exports.getRefreshTokenCookieOptions)());
exports.setAuthenticationCookies = setAuthenticationCookies;
// Updated clearAuthenticationCookies function
const clearAuthenticationCookies = (res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: app_config_1.config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000,
    };
    // Clear accessToken cookie
    res.clearCookie('accessToken', cookieOptions);
    // Clear refreshToken cookie with its specific path
    res.clearCookie('refreshToken', {
        ...cookieOptions,
        path: exports.REFRESH_PATH,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res;
};
exports.clearAuthenticationCookies = clearAuthenticationCookies;

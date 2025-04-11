"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const date_time_1 = require("../../common/utils/date-time");
const session_model_1 = __importDefault(require("../../database/models/session.model"));
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const verification_model_1 = __importDefault(require("../../database/models/verification.model"));
const app_config_1 = require("../../config/app.config");
const jwt_1 = require("../../common/utils/jwt");
const mailer_1 = require("../../mailers/mailer");
const template_1 = require("../../mailers/templates/template");
const http_config_1 = require("../../config/http.config");
const bcrypt_1 = require("../../common/utils/bcrypt");
const logger_1 = require("../../common/utils/logger");
const catch_error_1 = require("../../common/utils/catch-error");
class AuthService {
    async register(registerData) {
        const { name, email, password } = registerData;
        const existingUser = await user_model_1.default.exists({
            email,
        });
        if (existingUser) {
            throw new catch_error_1.BadRequestException('User already exists with this email', "AUTH_EMAIL_ALREADY_EXISTS" /* ErrorCode.AUTH_EMAIL_ALREADY_EXISTS */);
        }
        const newUser = await user_model_1.default.create({
            name,
            email,
            password,
        });
        const userId = newUser._id;
        const verification = await verification_model_1.default.create({
            userId,
            type: "EMAIL_VERIFICATION" /* VerificationEnum.EMAIL_VERIFICATION */,
            expiresAt: (0, date_time_1.fortyFiveMinutesFromNow)(),
        });
        // Sending verification email link
        const verificationUrl = `${app_config_1.config.APP_ORIGIN}/confirm-account?code=${verification.code}`;
        await (0, mailer_1.sendEmail)({
            to: newUser.email,
            ...(0, template_1.verifyEmailTemplate)(verificationUrl),
        });
        return {
            user: newUser,
        };
    }
    async login(loginData) {
        const { email, password, userAgent } = loginData;
        logger_1.logger.info(`Login attempt for email: ${email}`);
        const user = await user_model_1.default.findOne({
            email: email,
        });
        if (!user) {
            logger_1.logger.warn(`Login failed: User with email ${email} not found`);
            throw new catch_error_1.BadRequestException('Invalid email or password provided', "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            logger_1.logger.warn(`Login failed: Invalid password for email: ${email}`);
            throw new catch_error_1.BadRequestException('Invalid email or password provided', "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
        }
        // Check if the user enable 2fa return user= null
        if (user.userPreferences.enable2FA) {
            logger_1.logger.info(`2FA required for user ID: ${user._id}`);
            return {
                user: {
                    _id: user._id,
                    email: user.email,
                },
                mfaRequired: true,
                accessToken: '',
                refreshToken: '',
            };
        }
        logger_1.logger.info(`Creating session for user ID: ${user._id}`);
        const session = await session_model_1.default.create({
            userId: user._id,
            userAgent,
        });
        const payload = {
            userId: user._id,
            sessionId: session._id,
        };
        logger_1.logger.info(`Signing tokens for user ID: ${user._id}`);
        const accessToken = (0, jwt_1.signJwtToken)(payload);
        const refreshToken = (0, jwt_1.signJwtToken)({
            sessionId: session._id,
        }, jwt_1.refreshTokenSignOptions);
        logger_1.logger.info(`Login successful for user ID: ${user._id} with sessionId of ${session._id} accessToken:${accessToken} refreshToken:${refreshToken}`);
        return {
            user,
            accessToken,
            refreshToken,
            mfaRequired: false,
            sessionId: session._id,
        };
    }
    async refreshToken(refreshToken) {
        const { payload } = (0, jwt_1.verifyJwtToken)(refreshToken, {
            secret: jwt_1.refreshTokenSignOptions.secret,
        });
        if (!payload) {
            throw new catch_error_1.UnauthorizedException('Invalid refresh token');
        }
        const session = await session_model_1.default.findById(payload.sessionId);
        const now = Date.now();
        if (!session) {
            throw new catch_error_1.UnauthorizedException('Session does not exist');
        }
        if (session.expiredAt.getTime() <= now) {
            throw new catch_error_1.UnauthorizedException('Session expired');
        }
        const sessionRequireRefresh = session.expiredAt.getTime() - now <= date_time_1.ONE_DAY_IN_MS;
        if (sessionRequireRefresh) {
            session.expiredAt = (0, date_time_1.calculateExpirationDate)(app_config_1.config.JWT.REFRESH_EXPIRES_IN);
            await session.save();
        }
        const newRefreshToken = sessionRequireRefresh
            ? (0, jwt_1.signJwtToken)({
                sessionId: session._id,
            }, jwt_1.refreshTokenSignOptions)
            : undefined;
        const accessToken = (0, jwt_1.signJwtToken)({
            userId: session.userId,
            sessionId: session._id,
        });
        return {
            accessToken,
            newRefreshToken,
        };
    }
    async verifyEmail(code) {
        const validCode = await verification_model_1.default.findOne({
            code: code,
            type: "EMAIL_VERIFICATION" /* VerificationEnum.EMAIL_VERIFICATION */,
            expiresAt: { $gt: new Date() },
        });
        if (!validCode) {
            throw new catch_error_1.BadRequestException('Invalid or expired verification code');
        }
        const updatedUser = await user_model_1.default.findByIdAndUpdate(validCode.userId, {
            isEmailVerified: true,
        }, { new: true });
        if (!updatedUser) {
            throw new catch_error_1.BadRequestException('Unable to verify email address', "VALIDATION_ERROR" /* ErrorCode.VALIDATION_ERROR */);
        }
        await validCode.deleteOne();
        return {
            user: updatedUser,
        };
    }
    async forgotPassword(email) {
        const user = await user_model_1.default.findOne({
            email: email,
        });
        if (!user) {
            throw new catch_error_1.NotFoundException('User not found');
        }
        //check mail rate limit is 2 emails per 3 or 10 min
        const timeAgo = (0, date_time_1.threeMinutesAgo)();
        const maxAttempts = 2;
        const count = await verification_model_1.default.countDocuments({
            userId: user._id,
            type: "PASSWORD_RESET" /* VerificationEnum.PASSWORD_RESET */,
            createdAt: { $gt: timeAgo },
        });
        if (count >= maxAttempts) {
            throw new catch_error_1.HttpException('Http Exception Error', http_config_1.HTTPSTATUS.TOO_MANY_REQUESTS, "AUTH_TOO_MANY_ATTEMPTS" /* ErrorCode.AUTH_TOO_MANY_ATTEMPTS */);
        }
        const expiresAt = (0, date_time_1.anHourFromNow)();
        const validCode = await verification_model_1.default.create({
            userId: user._id,
            type: "PASSWORD_RESET" /* VerificationEnum.PASSWORD_RESET */,
            expiresAt,
        });
        const resetLink = `${app_config_1.config.APP_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;
        const { data, error } = await (0, mailer_1.sendEmail)({
            to: user.email,
            ...(0, template_1.passwordResetTemplate)(resetLink),
        });
        if (!data?.id) {
            return "INTERNAL_SERVER_ERROR" /* ErrorCode.INTERNAL_SERVER_ERROR */;
        }
        return {
            url: resetLink,
            emailId: data.id,
        };
    }
    async resetPassword({ password, verificationCode }) {
        const validCode = await verification_model_1.default.findOne({
            code: verificationCode,
            type: "PASSWORD_RESET" /* VerificationEnum.PASSWORD_RESET */,
            expiresAt: { $gt: new Date() },
        });
        if (!validCode) {
            throw new catch_error_1.NotFoundException('Invalid or expired verification code');
        }
        const hashedPassword = await (0, bcrypt_1.hashValue)(password);
        const updatedUser = await user_model_1.default.findByIdAndUpdate(validCode.userId, {
            password: hashedPassword,
        });
        if (!updatedUser) {
            throw new catch_error_1.BadRequestException('Failed to reset password!');
        }
        await validCode.deleteOne();
        await session_model_1.default.deleteMany({
            userId: updatedUser._id,
        });
        return {
            user: updatedUser,
        };
    }
    async logout(sessionId) {
        const session = await session_model_1.default.findByIdAndDelete(sessionId);
        if (!session) {
            throw new catch_error_1.NotFoundException(`Session not found.`);
        }
        return session;
    }
}
exports.AuthService = AuthService;

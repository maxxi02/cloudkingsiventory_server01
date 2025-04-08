"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaService = void 0;
const catch_error_1 = require("../../common/utils/catch-error");
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const jwt_1 = require("../../common/utils/jwt");
const session_model_1 = __importDefault(require("../../database/models/session.model"));
const logger_1 = require("../../common/utils/logger");
class MfaService {
    async generateMFASetup(userId) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new catch_error_1.UnauthorizedException('User not authorized');
        }
        if (user.userPreferences.enable2FA) {
            return {
                message: 'MFA already enabled',
            };
        }
        let secretKey = user.userPreferences.twoFactorSecret;
        if (!secretKey) {
            const secret = speakeasy_1.default.generateSecret({ name: 'Cloud Kings' });
            secretKey = secret.base32;
            user.userPreferences.twoFactorSecret = secretKey;
            await user.save();
        }
        const url = speakeasy_1.default.otpauthURL({
            secret: secretKey,
            label: `${user.name}`,
            issuer: 'cloudkings.com',
            encoding: 'base32',
        });
        console.log(url);
        const qrImageUrl = await qrcode_1.default.toDataURL(url);
        return {
            message: 'Scan the qrcode or use the setup key.',
            secret: secretKey,
            qrImageUrl,
        };
    }
    async verifyMFASetup(userId, code, secretKey) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new catch_error_1.UnauthorizedException('User not authorized');
        }
        if (user.userPreferences.enable2FA) {
            return {
                message: 'MFA is already enabled',
                userPreferences: { enable2FA: user.userPreferences.enable2FA },
            };
        }
        //verifying the secret and token
        const isValid = speakeasy_1.default.totp.verify({
            secret: secretKey,
            encoding: 'base32',
            token: code,
            window: 1,
        });
        if (!isValid) {
            console.log(`MFA code entered:${code}\n is MFA code valid: ${isValid}`);
            throw new catch_error_1.BadRequestException('Invalid MFA code. Please try again');
        }
        user.userPreferences.enable2FA = true;
        await user.save();
        return {
            message: 'MFA setup completed successfully',
            userPreferences: { enable2FA: user.userPreferences.enable2FA },
        };
    }
    async revokeMFASetup(userId) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new catch_error_1.UnauthorizedException('User not authorized');
        }
        if (!user.userPreferences.enable2FA) {
            return {
                message: 'MFA is not enabled',
                userPreferences: { enable2FA: user.userPreferences.enable2FA },
            };
        }
        user.userPreferences.twoFactorSecret = undefined;
        user.userPreferences.enable2FA = false;
        await user.save();
        return {
            message: 'MFA revoke successfully',
            userPreferences: { enable2FA: user.userPreferences.enable2FA },
        };
    }
    async verifyMFAForLogin(code, email, userAgent) {
        const user = await user_model_1.default.findOne({ email: email });
        if (!user)
            throw new catch_error_1.NotFoundException('User  not found');
        if (!user.userPreferences.enable2FA ||
            !user.userPreferences.twoFactorSecret) {
            throw new catch_error_1.UnauthorizedException('MFA not enabled or improperly configured');
        }
        const isValid = speakeasy_1.default.totp.verify({
            secret: user.userPreferences.twoFactorSecret,
            encoding: 'base32',
            token: code,
            window: 2,
        });
        if (!isValid) {
            throw new catch_error_1.BadRequestException('Invalid MFA code. Please try again.');
        }
        let session, accessToken, refreshToken;
        try {
            session = await session_model_1.default.create({
                userId: user._id,
                userAgent,
            });
            accessToken = (0, jwt_1.signJwtToken)({
                userId: user._id,
                sessionId: session._id,
            });
            refreshToken = (0, jwt_1.signJwtToken)({
                sessionId: session._id,
            }, jwt_1.refreshTokenSignOptions);
        }
        catch (error) {
            logger_1.logger.error(`Session creation failed: ${error}`);
            throw new catch_error_1.InternalServerError('Failed to create session');
        }
        return {
            user,
            accessToken,
            refreshToken,
        };
    }
}
exports.MfaService = MfaService;

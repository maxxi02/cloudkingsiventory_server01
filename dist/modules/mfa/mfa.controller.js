"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const catch_error_1 = require("../../common/utils/catch-error");
const http_config_1 = require("../../config/http.config");
const mfa_validator_1 = require("../../common/validators/mfa.validator");
const cookie_1 = require("../../common/utils/cookie");
class MfaController {
    constructor(mfaService) {
        this.generateMFASetup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new catch_error_1.UnauthorizedException('User not authenticated');
            }
            const { secret, qrImageUrl, message } = await this.mfaService.generateMFASetup(userId);
            res.status(http_config_1.HTTPSTATUS.OK_BABY).json({ message, secret, qrImageUrl });
        });
        this.verifyMFASetup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new catch_error_1.UnauthorizedException('User not authorized.');
            }
            const { code, secretKey } = mfa_validator_1.verifyMfaSchema.parse({ ...req.body });
            const result = await this.mfaService.verifyMFASetup(userId, code, secretKey);
            return res.status(http_config_1.HTTPSTATUS.OK_BABY).json(result);
        });
        this.revokeMFASetup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new catch_error_1.UnauthorizedException('User not authorized');
            }
            const { message, userPreferences } = await this.mfaService.revokeMFASetup(userId);
            return res.status(http_config_1.HTTPSTATUS.OK_BABY).json({ message, userPreferences });
        });
        this.verifyMFAForLogin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { code, email, userAgent } = mfa_validator_1.verifyMFAForLoginSchema.parse({
                ...req.body,
                userAgent: req.headers['user-agent'],
            });
            const { accessToken, refreshToken, user } = await this.mfaService.verifyMFAForLogin(code, email, userAgent);
            return (0, cookie_1.setAuthenticationCookies)({
                res,
                accessToken,
                refreshToken,
            })
                .status(http_config_1.HTTPSTATUS.OK_BABY)
                .json({
                message: 'Verified & login successfully',
                user,
            });
        });
        this.mfaService = mfaService;
    }
}
exports.MfaController = MfaController;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = exports.setupJwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const app_config_1 = require("../../config/app.config");
const passport_1 = __importDefault(require("passport"));
const user_module_1 = require("../../modules/user/user.module");
const catch_error_1 = require("../utils/catch-error");
const session_model_1 = __importDefault(require("../../database/models/session.model"));
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
        (req) => {
            let token = req.cookies?.accessToken;
            if (!token && req.headers.authorization) {
                const authHeader = req.headers.authorization;
                token = authHeader.startsWith('Bearer ')
                    ? authHeader.split(' ')[1]
                    : null;
            }
            if (!token) {
                throw new catch_error_1.UnauthorizedException('Unauthorized access token');
            }
            return token;
        },
    ]),
    secretOrKey: app_config_1.config.JWT.SECRET,
    audience: ['user'],
    algorithms: ['HS256'],
    passReqToCallback: true,
};
const setupJwtStrategy = (passport) => {
    passport.use('jwt', new passport_jwt_1.Strategy(options, async (req, payload, done) => {
        try {
            const user = await user_module_1.userService.findUserById(payload.userId);
            const session = await session_model_1.default.findById(payload.sessionId);
            if (!user) {
                return done(null, undefined);
            }
            if (!session) {
                return done(null, undefined);
            }
            req.sessionId = payload.sessionId;
            req.id = payload.userId;
            return done(null, user);
        }
        catch (error) {
            return done(error instanceof Error ? error : new Error(String(error)), undefined);
        }
    }));
};
exports.setupJwtStrategy = setupJwtStrategy;
exports.authenticateJWT = passport_1.default.authenticate('jwt', { session: false });

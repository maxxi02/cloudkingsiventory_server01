"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const catch_error_1 = require("../../common/utils/catch-error");
const session_model_1 = __importDefault(require("../../database/models/session.model"));
class SessionService {
    async getAllSession(userId) {
        const sessions = await session_model_1.default.find({
            userId,
            expiredAt: { $gt: Date.now() },
        }, {
            _id: 1,
            userId: 1,
            userAgent: 1,
            createdAt: 1,
            expiredAt: 1,
        }, {
            sort: {
                createdAt: -1,
            },
        });
        return {
            sessions,
        };
    }
    async getSessionById(sessionId) {
        const session = await session_model_1.default.findById(sessionId)
            .populate('userId')
            .select('-expiresAt');
        if (!session) {
            throw new catch_error_1.NotFoundException('Session not found');
        }
        const { userId: user } = session;
        return {
            user,
        };
    }
    async deleteSession(sessionId, userId) {
        const deletedSession = await session_model_1.default.findByIdAndDelete({
            _id: sessionId,
            userId: userId,
        });
        if (!deletedSession) {
            throw new catch_error_1.NotFoundException('Session not found');
        }
        return;
    }
}
exports.SessionService = SessionService;

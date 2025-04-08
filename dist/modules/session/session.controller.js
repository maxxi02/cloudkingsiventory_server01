"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const catch_error_1 = require("../../common/utils/catch-error");
const http_config_1 = require("../../config/http.config");
const zod_1 = require("zod");
class SessionController {
    constructor(sessionService) {
        this.getAllSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            const sessionId = req.sessionId;
            console.log(userId);
            if (!userId) {
                throw new catch_error_1.UnauthorizedException('User not authenticated');
            }
            const { sessions } = await this.sessionService.getAllSession(userId);
            const modifySessions = sessions.map((session) => ({
                ...session.toObject(),
                ...(session.id === sessionId && { isCurrent: true }),
            }));
            return res.status(http_config_1.HTTPSTATUS.OK_BABY).json({
                message: 'Retrieved all session successfully',
                sessions: modifySessions,
            });
        });
        this.getSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const sessionId = req.sessionId;
            if (!sessionId) {
                throw new catch_error_1.UnauthorizedException('Session not authenticated');
            }
            const { user } = await this.sessionService.getSession(sessionId);
            return res.status(http_config_1.HTTPSTATUS.OK_BABY).json({
                message: 'Retrieved session successfully',
                user,
            });
        });
        this.deleteSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            try {
                const sessionId = zod_1.z.string().parse(req.params.id);
                const userId = req.user?.id;
                if (!userId) {
                    throw new catch_error_1.NotFoundException('UserId not found');
                }
                const session = await this.sessionService.deleteSession(sessionId, userId);
                return res.status(http_config_1.HTTPSTATUS.OK_BABY).json({
                    message: 'Session remove successfully',
                    session,
                });
            }
            catch (error) {
                console.log('Error deleting session:', error);
                throw new catch_error_1.NotFoundException('Session not found');
            }
        });
        this.sessionService = sessionService;
    }
}
exports.SessionController = SessionController;

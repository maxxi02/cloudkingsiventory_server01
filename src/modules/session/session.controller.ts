import { SessionService } from './session.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import {
  NotFoundException,
  UnauthorizedException,
} from '../../common/utils/catch-error';
import { HTTPSTATUS } from '../../config/http.config';
import { Request, Response } from 'express';
import { z } from 'zod';

export class SessionController {
  private sessionService: SessionService;

  constructor(sessionService: SessionService) {
    this.sessionService = sessionService;
  }

  public getAllSession = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userId = req.user?.id;
      const sessionId = req.sessionId;
      console.log(userId);
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }
      const { sessions } = await this.sessionService.getAllSession(userId);
      const modifySessions = sessions.map((session) => ({
        ...session.toObject(),
        ...(session.id === sessionId && { isCurrent: true }),
      }));

      return res.status(HTTPSTATUS.OK_BABY).json({
        message: 'Retrieved all session successfully',
        sessions: modifySessions,
      });
    },
  );
  public getSession = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = req.sessionId;
      if (!sessionId) {
        throw new UnauthorizedException('Session not authenticated');
      }
      const { user } = await this.sessionService.getSession(sessionId);
      return res.status(HTTPSTATUS.OK_BABY).json({
        message: 'Retrieved session successfully',
        user,
      });
    },
  );
  public deleteSession = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      try {
        const sessionId = z.string().parse(req.params.id);
        const userId = req.user?.id;
        if (!userId) {
          throw new NotFoundException('UserId not found');
        }
        const session = await this.sessionService.deleteSession(
          sessionId,
          userId,
        );

        return res.status(HTTPSTATUS.OK_BABY).json({
          message: 'Session remove successfully',
          session,
        });
      } catch (error) {
        console.log('Error deleting session:', error);
        throw new NotFoundException('Session not found');
      }
    },
  );
}

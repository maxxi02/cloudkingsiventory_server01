import { SessionService } from './session.service';
import { HTTPSTATUS } from '../../config/http.config';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { NotFoundException } from '../../common/utils/catch-error';
import { Request, Response } from 'express';
export class SessionController {
  private sessionService: SessionService;

  constructor(sessionService: SessionService) {
    this.sessionService = sessionService;
  }

  public getAllSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any).id;

    const sessionId = req.sessionID;

    const { sessions } = await this.sessionService.getAllSession(
      z.string().parse(userId),
    );

    const modifySessions = sessions.map((session) => ({
      ...session.toObject(),
      ...(session.id === sessionId && {
        isCurrent: true,
      }),
    }));

    return res.status(HTTPSTATUS.OK_BABY).json({
      message: 'Retrieved all session successfully',
      sessions: modifySessions,
    });
  });

  public getSession = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req?.sessionID;

    if (!sessionId) {
      throw new NotFoundException('Session ID not found. Please log in.');
    }

    const { user } = await this.sessionService.getSessionById(sessionId);

    return res.status(HTTPSTATUS.OK_BABY).json({
      message: 'Session retrieved successfully',
      user,
    });
  });

  public deleteSession = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = z.string().parse(req.params.id);
    const userId = z.string().parse((req.user as any).id);
    await this.sessionService.deleteSession(sessionId, userId);

    return res.status(HTTPSTATUS.OK_BABY).json({
      message: 'Session remove successfully',
    });
  });
}

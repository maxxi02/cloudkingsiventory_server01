import { Request, Response } from 'express';
import { SessionService } from './session.service';
import { HTTPSTATUS } from '../../config/http.config';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { NotFoundException } from '../../common/utils/catch-error';

export class SessionController {
  private sessionService: SessionService;

  constructor(sessionService: SessionService) {
    this.sessionService = sessionService;
  }

  public getAllSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const sessionId = req.sessionId;
    if (!userId) {
      throw new NotFoundException('User ID not found. Please log in.');
    }
    const { sessions } = await this.sessionService.getAllSession(userId);

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
    const sessionId = req?.sessionId;

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
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException('User ID not found. Please log in.');
    }
    await this.sessionService.deleteSession(sessionId, userId);

    return res.status(HTTPSTATUS.OK_BABY).json({
      message: 'Session remove successfully',
    });
  });
}



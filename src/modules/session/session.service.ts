import { NotFoundException } from '../../common/utils/catch-error';
import SessionModel from '../../database/models/session.model';

export class SessionService {
  public async getAllSession(userId: string) {
    const sessions = await SessionModel.find(
      {
        userId,
        expiredAt: { $gt: Date.now() },
      },
      {
        _id: 1,
        userId: 1,
        userAgent: 1,
        createdAt: 1,
        expiredAt: 1,
      },
      {
        sort: { createdAt: -1 },
      },
    );

    return { sessions };
  }
  public async getSession(sessionId: string) {
    const session = await SessionModel.findById(sessionId)
      .populate('userId')
      .select('-expiresAt');
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    const { userId: user } = session;
    return { user };
  }
  public async deleteSession(sessionId: string, userId: string) {
    const deleteSession = await SessionModel.findByIdAndDelete({
      _id: sessionId,
      userId: userId,
    });

    if (!deleteSession) {
      throw new NotFoundException('Session not found');
    }
    return;
  }
}

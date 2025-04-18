import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptionsWithRequest,
} from 'passport-jwt';
import { config } from '../../config/app.config';
import passport, { PassportStatic } from 'passport';
import { userService } from '../../modules/user/user.module';
import { UnauthorizedException } from '../utils/catch-error';
import SessionModel from '../../database/models/session.model';
import express from 'express';
import { UserDocuments } from '../../database/models/user.model';

interface JwtPayload {
  userId: string;
  sessionId: string;
}

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      let token = req.cookies?.accessToken;
      if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        token = authHeader.startsWith('Bearer ')
          ? authHeader.split(' ')[1]
          : null;
      }
      if (!token) {
        throw new UnauthorizedException('Unauthorized access token');
      }
      return token;
    },
  ]),
  secretOrKey: config.JWT.SECRET,
  audience: ['user'],
  algorithms: ['HS256'],
  passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
  passport.use(
    'jwt',
    new JwtStrategy(
      options,
      async (
        req: express.Request,
        payload: JwtPayload,
        done: (error: Error | null, user?: UserDocuments) => void,
      ) => {
        try {
          const user = await userService.findUserById(payload.userId);
          const session = await SessionModel.findById(payload.sessionId);
          if (!user) {
            return done(null, undefined);
          }
          if (!session) {
            return done(null, undefined);
          }
          req.sessionId = payload.sessionId;
          req.id = payload.userId;
          return done(null, user);
        } catch (error) {
          return done(
            error instanceof Error ? error : new Error(String(error)),
            undefined,
          );
        }
      },
    ),
  );
};

export const authenticateJWT = passport.authenticate('jwt', { session: false });

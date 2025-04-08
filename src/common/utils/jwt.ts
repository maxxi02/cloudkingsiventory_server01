import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { SessionDocument } from '../../database/models/session.model';
import { config } from '../../config/app.config';
import { UserDocuments } from '../../database/models/user.model';

const accessTokenExpiresIn = 15 * 60; // 15 minutes
const refreshTokenExpiresIn = 7 * 24 * 60 * 60; // 7 days

export type AccessTPayload = {
  userId: UserDocuments['_id'];
  sessionId: SessionDocument['_id'];
};

export type RefreshTPayload = {
  sessionId: SessionDocument['_id'];
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
};

const defaults: SignOptions = {
  audience: ['user'],
};

export const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: accessTokenExpiresIn,
  secret: config.JWT.SECRET,
};

export const refreshTokenSignOptions: SignOptsAndSecret = {
  expiresIn: refreshTokenExpiresIn,
  secret: config.JWT.REFRESH_SECRET,
};

export const signJwtToken = (
  payload: AccessTPayload | RefreshTPayload,
  options?: SignOptsAndSecret,
) => {
  const { secret, ...opts } = options || accessTokenSignOptions;
  return jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });
};

export const verifyJwtToken = <TPayload extends object = AccessTPayload>(
  token: string,
  options?: VerifyOptions & { secret: string },
) => {
  try {
    const { secret = config.JWT.SECRET, ...opts } = options || {};
    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...opts,
    }) as TPayload;
    return { payload };
  } catch (error: any) {
    return { error: error.message };
  }
};

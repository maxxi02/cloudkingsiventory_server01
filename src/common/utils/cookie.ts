import { CookieOptions, Response } from 'express';
import { config } from '../../config/app.config';
import { calculateExpirationDate } from './date-time';

type CookiePayloadType = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const REFRESH_PATH = `${config.BASE_PATH}/auth/refresh`;

const defaults: CookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production' ? true : false,
  sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
};

export const getRefreshTokenCookieOptions = (): CookieOptions => {
  const expiresIn = config.JWT.REFRESH_EXPIRES_IN;
  const expires = calculateExpirationDate(expiresIn);
  return {
    ...defaults,
    expires,
    path: REFRESH_PATH,
  };
};

export const getAccessTokenCookieOptions = (): CookieOptions => {
  const expiresIn = config.JWT.EXPIRES_IN;
  const expires = calculateExpirationDate(expiresIn);
  return {
    ...defaults,
    expires,
    path: '/',
  };
};

export const setAuthenticationCookies = ({
  res,
  accessToken,
  refreshToken,
}: CookiePayloadType): Response =>
  res
    .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
    .cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

// Updated clearAuthenticationCookies function
export const clearAuthenticationCookies = (res: Response): Response => {
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 15 * 60 * 1000,
  };

  // Clear accessToken cookie
  res.clearCookie('accessToken', cookieOptions);

  // Clear refreshToken cookie with its specific path
  res.clearCookie('refreshToken', {
    ...cookieOptions,
    path: REFRESH_PATH,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res;
};

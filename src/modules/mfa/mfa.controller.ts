import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { MfaService } from './mfa.service';
import { UnauthorizedException } from '../../common/utils/catch-error';
import { HTTPSTATUS } from '../../config/http.config';
import {
  verifyMFAForLoginSchema,
  verifyMfaSchema,
} from '../../common/validators/mfa.validator';
import { setAuthenticationCookies } from '../../common/utils/cookie';
import { logger } from '../../common/utils/logger';

export class MfaController {
  private mfaService: MfaService;

  constructor(mfaService: MfaService) {
    this.mfaService = mfaService;
  }

  public generateMFASetup = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }
      const { secret, qrImageUrl, message } =
        await this.mfaService.generateMFASetup(userId);

      res.status(HTTPSTATUS.OK_BABY).json({ message, secret, qrImageUrl });
    },
  );

  public verifyMFASetup = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authorized.');
    }
    const { code, secretKey } = verifyMfaSchema.parse({ ...req.body });
    const result = await this.mfaService.verifyMFASetup(
      userId,
      code,
      secretKey,
    );

    return res.status(HTTPSTATUS.OK_BABY).json(result);
  });

  public revokeMFASetup = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }
    const { message, userPreferences } =
      await this.mfaService.revokeMFASetup(userId);
    return res.status(HTTPSTATUS.OK_BABY).json({ message, userPreferences });
  });

  public verifyMFAForLogin = asyncHandler(
    async (req: Request, res: Response) => {
      const { code, email, userAgent } = verifyMFAForLoginSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
      });

      const { accessToken, refreshToken, user } =
        await this.mfaService.verifyMFAForLogin(code, email, userAgent);

      return setAuthenticationCookies({
        res,
        accessToken,
        refreshToken,
      })
        .status(HTTPSTATUS.OK_BABY)
        .json({
          message: 'Verified & login successfully',
          user,
        });
    },
  );
}

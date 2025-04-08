import {
  BadRequestException,
  InternalServerError,
  NotFoundException,
  UnauthorizedException,
} from '../../common/utils/catch-error';
import UserModel from '../../database/models/user.model';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { refreshTokenSignOptions, signJwtToken } from '../../common/utils/jwt';
import SessionModel from '../../database/models/session.model';
import { logger } from '../../common/utils/logger';

export class MfaService {
  public async generateMFASetup(userId: string): Promise<any> {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }

    if (user.userPreferences.enable2FA) {
      return {
        message: 'MFA already enabled',
      };
    }
    let secretKey = user.userPreferences.twoFactorSecret;
    if (!secretKey) {
      const secret = speakeasy.generateSecret({ name: 'Cloud Kings' });
      secretKey = secret.base32;
      user.userPreferences.twoFactorSecret = secretKey;
      await user.save();
    }
    const url = speakeasy.otpauthURL({
      secret: secretKey,
      label: `${user.name}`,
      issuer: 'cloudkings.com',
      encoding: 'base32',
    });
    console.log(url);
    const qrImageUrl = await qrcode.toDataURL(url);

    return {
      message: 'Scan the qrcode or use the setup key.',
      secret: secretKey,
      qrImageUrl,
    };
  }
  public async verifyMFASetup(
    userId: string,
    code: string,
    secretKey: string,
  ): Promise<any> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }
    if (user.userPreferences.enable2FA) {
      return {
        message: 'MFA is already enabled',
        userPreferences: { enable2FA: user.userPreferences.enable2FA },
      };
    }

    //verifying the secret and token
    const isValid = speakeasy.totp.verify({
      secret: secretKey,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!isValid) {
      console.log(`MFA code entered:${code}\n is MFA code valid: ${isValid}`);
      throw new BadRequestException('Invalid MFA code. Please try again');
    }
    user.userPreferences.enable2FA = true;
    await user.save();
    return {
      message: 'MFA setup completed successfully',
      userPreferences: { enable2FA: user.userPreferences.enable2FA },
    };
  }

  public async revokeMFASetup(userId: string): Promise<any> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }

    if (!user.userPreferences.enable2FA) {
      return {
        message: 'MFA is not enabled',
        userPreferences: { enable2FA: user.userPreferences.enable2FA },
      };
    }
    user.userPreferences.twoFactorSecret = undefined;
    user.userPreferences.enable2FA = false;
    await user.save();

    return {
      message: 'MFA revoke successfully',
      userPreferences: { enable2FA: user.userPreferences.enable2FA },
    };
  }

  public async verifyMFAForLogin(
    code: string,
    email: string,
    userAgent?: string,
  ): Promise<any> {
    const user = await UserModel.findOne({ email: email });

    if (!user) throw new NotFoundException('User  not found');

    if (
      !user.userPreferences.enable2FA ||
      !user.userPreferences.twoFactorSecret
    ) {
      throw new UnauthorizedException(
        'MFA not enabled or improperly configured',
      );
    }

    const isValid = speakeasy.totp.verify({
      secret: user.userPreferences.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });
    if (!isValid) {
      throw new BadRequestException('Invalid MFA code. Please try again.');
    }

    let session, accessToken, refreshToken;
    try {
      session = await SessionModel.create({
        userId: user._id,
        userAgent,
      });
      accessToken = signJwtToken({
        userId: user._id,
        sessionId: session._id,
      });

      refreshToken = signJwtToken(
        {
          sessionId: session._id,
        },
        refreshTokenSignOptions,
      );
    } catch (error) {
      logger.error(`Session creation failed: ${error}`);
      throw new InternalServerError('Failed to create session');
    }

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}

import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/shared/enums/role.enum';
import { LoginResponse } from 'src/shared/response/login-response';
import { CryptoUtil } from 'src/shared/utils/crypto.util';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';
import {
  AUTH_PROVIDER_TOKEN,
  IAuthenticatableService,
  IAuthProfile,
} from './types/authenticatable.interface';
import { JwtPayload } from './types/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_PROVIDER_TOKEN)
    private readonly authProviders: IAuthenticatableService[],
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async login(data: LoginDto, ip: string, userAgent = ''): Promise<LoginResponse> {
    let account: IAuthProfile | null = null;

    for (const provider of this.authProviders) {
      const profile = await provider.authenticateIdentity(data.identity);
      if (profile) {
        account = profile;
        break;
      }
    }

    if (!account) throw new UnauthorizedException('Invalid identity or password');

    const isPasswordCorrect = await CryptoUtil.comparePassword(data.password, account.passwordHash);
    if (!isPasswordCorrect) throw new UnauthorizedException('Invalid identity or password');

    if (account.role === Role.USER && !account.isVerified)
      throw new ForbiddenException('Please verify your email address before logging in.');

    return this.generateSession(
      account.id,
      account.identity,
      account.role,
      ip,
      userAgent,
      account.userId,
    );
  }

  async refresh(token: string, ip: string, userAgent = ''): Promise<LoginResponse> {
    const payload = this.verifyTokenSignature(token, ip, userAgent);

    const dbToken = await this.refreshTokenService.findToken(payload.role, token);

    if (!dbToken || dbToken.isValid !== 1 || new Date() > new Date(dbToken.expireAt))
      throw new UnauthorizedException('Invalid or expired refresh token');

    await this.refreshTokenService.invalidateToken(payload.role, token);

    const config = this.refreshTokenService.getRegistryOrThrow(payload.role);
    const entityId = dbToken[config.idField] as number;
    const userId = payload.role === Role.WORKER ? dbToken.userId : undefined;

    return this.generateSession(entityId, payload.identity, payload.role, ip, userAgent, userId);
  }

  private async generateSession(
    id: number,
    identity: string,
    role: Role,
    ip: string,
    userAgent: string,
    userId?: number,
  ): Promise<LoginResponse> {
    const payload = { Id: id, identity, role, ipAddress: ip, userAgent, userId };
    const secret = this.configService.get<string>('JWT_SECRET') || 'DEFAULT_SECRET_PRODUKCIJA';

    const token = this.jwtService.sign(payload, { expiresIn: '5m', secret });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '31d', secret });

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 31);

    await this.refreshTokenService.saveToken(role, id, refreshToken, expireDate);

    return {
      id,
      identity,
      token,
      refreshToken,
      tokenExpire: expireDate.toISOString(),
    };
  }

  private verifyTokenSignature(token: string, ip: string, userAgent: string): JwtPayload {
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'DEFAULT_SECRET_PRODUKCIJA';
      const payload = this.jwtService.verify<JwtPayload>(token, { secret });

      if (ip !== payload.ipAddress || userAgent !== payload.userAgent) {
        throw new UnauthorizedException('Security violation: IP or User-Agent mismatch');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token signature');
    }
  }
}

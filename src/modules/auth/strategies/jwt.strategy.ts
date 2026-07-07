import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdministratorService } from 'src/modules/administrator/administrator.service';
import { UserService } from 'src/modules/user/user.service';
import { Role } from 'src/shared/enums/role.enum';

import { JwtPayload, AuthenticatedUser } from '../types/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly administratorService: AdministratorService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'DEFAULT_SECRET_PRODUKCIJA',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    if (payload.role === Role.WORKER) {
      return {
        id: payload.Id,
        identity: payload.identity,
        role: payload.role as Role,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
        userId: payload.userId,
      };
    }

    if (payload.role === Role.ADMINISTRATOR) {
      const admin = await this.administratorService.getAdminById(payload.Id);
      if (!admin || admin.username !== payload.identity) {
        throw new UnauthorizedException('User session invalid or data mismatch');
      }

      return {
        id: payload.Id,
        identity: payload.identity,
        role: Role.ADMINISTRATOR,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
      };
    }

    const user = await this.userService.getUserById(payload.Id);
    if (!user || user.email !== payload.identity) {
      throw new UnauthorizedException('User session invalid or data mismatch');
    }

    return {
      id: user.userId,
      identity: user.email,
      role: Role.USER,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    };
  }
}

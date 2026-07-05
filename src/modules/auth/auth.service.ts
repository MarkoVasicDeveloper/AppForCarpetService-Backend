import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AdministratorService } from 'src/modules/administrator/administrator.service';
import { UserService } from 'src/modules/user/user.service';
import { Role } from 'src/shared/enums/role.enum';
import { LoginResponse } from 'src/shared/response/login-response';
import { CryptoUtil } from 'src/shared/utils/crypto.util';
import { Repository } from 'typeorm';

import { LoginDto } from './dto/login.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtPayload } from './types/jwt-payload.interface';

interface IDatabaseToken {
  isValid: number;
  expireAt: string | Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async login(data: LoginDto, ip: string, userAgent = ''): Promise<LoginResponse> {
    let account: {
      id: number;
      identity: string;
      passwordHash: string;
      role: Role;
    } | null = null;

    const admin = await this.administratorService.getAdminByUsername({ username: data.identity });
    if (admin) {
      account = {
        id: admin.administratorId,
        identity: admin.username,
        passwordHash: admin.passwordHash,
        role: Role.ADMINISTRATOR,
      };
    } else {
      const user = await this.userService.getUserByEmail({ email: data.identity });
      if (user) {
        account = {
          id: user.userId,
          identity: user.email,
          passwordHash: user.passwordHash,
          role: Role.USER,
        };
      }
    }

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (CryptoUtil.hashPassword(data.password) !== account.passwordHash) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return this.generateSession(account.id, account.identity, account.role, ip, userAgent);
  }

  async refresh(token: string, ip: string, userAgent = ''): Promise<LoginResponse> {
    const payload = this.verifyTokenSignature(token, ip, userAgent);
    let tokenRecord: IDatabaseToken | null = null;

    if (payload.role === Role.ADMINISTRATOR) {
      tokenRecord = await this.administratorService.getAdminToken(token);
    } else {
      tokenRecord = await this.userService.getUserToken(token);
    }

    this.validateDatabaseToken(tokenRecord);

    if (payload.role === Role.ADMINISTRATOR) {
      await this.administratorService.invalidateToken(token);
    } else {
      await this.userService.invalidateToken(token);
    }

    return this.generateSession(payload.Id, payload.identity, payload.role, ip, userAgent);
  }

  async invalidAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepo.update({ userId: userId, isValid: 1 }, { isValid: 0 });
  }

  private buildPayload(
    id: number,
    identity: string,
    role: Role,
    ip: string,
    userAgent: string,
  ): JwtPayload {
    return { Id: id, identity, role, ipAddress: ip, userAgent };
  }

  private async generateSession(
    id: number,
    identity: string,
    role: Role,
    ip: string,
    userAgent: string,
  ): Promise<LoginResponse> {
    const payload = this.buildPayload(id, identity, role, ip, userAgent);

    const secret = this.configService.get<string>('JWT_SECRET') || 'DEFAULT_SECRET_PRODUKCIJA';

    const token = this.jwtService.sign(payload, { expiresIn: '5m', secret });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '31d', secret });

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 31);

    if (role === Role.ADMINISTRATOR) {
      await this.administratorService.createAdminToken(id, expireDate.toISOString(), refreshToken);
    } else {
      await this.userService.createToken(id, expireDate.toISOString(), refreshToken);
    }

    return {
      id: id,
      identity,
      token,
      refreshToken,
      tokenExpire: expireDate.toISOString(),
    };
  }

  private validateDatabaseToken(tokenRecord: IDatabaseToken | null): void {
    if (!tokenRecord) throw new NotFoundException('Token not found in database');
    if (tokenRecord.isValid === 0) throw new UnauthorizedException('Token is no longer valid');
    if (new Date(tokenRecord.expireAt).getTime() < Date.now()) {
      throw new UnauthorizedException('Token has expired');
    }
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

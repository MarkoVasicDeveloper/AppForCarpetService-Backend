import * as crypto from 'crypto';

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AdministratorService } from 'src/modules/administrator/administrator.service';
import { UserService } from 'src/modules/user/user.service';
import { LoginResponse } from 'src/shared/response/login-response';
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
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha512').update(password).digest('hex').toUpperCase();
  }

  async login(data: LoginDto, ip: string, userAgent = ''): Promise<LoginResponse> {
    let account: {
      id: number;
      identity: string;
      passwordHash: string;
      role: 'administrator' | 'user';
    } | null = null;

    const admin = await this.administratorService.getAdminByUsername({ username: data.identity });
    if (admin) {
      account = {
        id: admin.administratorId,
        identity: admin.username,
        passwordHash: admin.passwordHash,
        role: 'administrator',
      };
    } else {
      const user = await this.userService.getUserByEmail({ email: data.identity });
      if (user) {
        account = {
          id: user.userId,
          identity: user.email,
          passwordHash: user.passwordHash,
          role: 'user',
        };
      }
    }

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (this.hashPassword(data.password) !== account.passwordHash) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return this.generateSession(account.id, account.identity, account.role, ip, userAgent);
  }

  async refresh(token: string, ip: string, userAgent = ''): Promise<LoginResponse> {
    const payload = this.verifyTokenSignature(token, ip, userAgent);
    let tokenRecord: IDatabaseToken | null = null;

    if (payload.role === 'administrator') {
      tokenRecord = await this.administratorService.getAdminToken(token);
    } else {
      tokenRecord = await this.userService.getUserToken(token);
    }

    this.validateDatabaseToken(tokenRecord);

    const newPayload = this.buildPayload(payload.Id, payload.identity, payload.role, ip, userAgent);
    const accessToken = this.jwtService.sign(newPayload, { expiresIn: '5m' });

    return {
      id: payload.Id,
      identity: payload.identity,
      token: accessToken,
      refreshToken: token,
      tokenExpire: new Date(tokenRecord!.expireAt).toISOString(),
    };
  }

  async invalidAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepo.update({ userId: userId, isValid: 1 }, { isValid: 0 });
  }

  private buildPayload(
    id: number,
    identity: string,
    role: 'administrator' | 'user',
    ip: string,
    userAgent: string,
  ): JwtPayload {
    return { Id: id, identity, role, ipAddress: ip, userAgent };
  }

  private async generateSession(
    id: number,
    identity: string,
    role: 'administrator' | 'user',
    ip: string,
    userAgent: string,
  ): Promise<LoginResponse> {
    const payload = this.buildPayload(id, identity, role, ip, userAgent);

    const token = this.jwtService.sign(payload, { expiresIn: '5m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '31d' });

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 31);

    if (role === 'administrator') {
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
      const payload = this.jwtService.verify<JwtPayload>(token);

      if (ip !== payload.ipAddress || userAgent !== payload.userAgent) {
        throw new UnauthorizedException('Security violation: IP or User-Agent mismatch');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token signature');
    }
  }
}

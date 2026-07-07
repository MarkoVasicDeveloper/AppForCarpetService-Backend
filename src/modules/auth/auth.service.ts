import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AdministratorService } from 'src/modules/administrator/administrator.service';
import { UserService } from 'src/modules/user/user.service';
import { WorkerService } from 'src/modules/worker/worker.service';
import { Role } from 'src/shared/enums/role.enum';
import { LoginResponse } from 'src/shared/response/login-response';
import { CryptoUtil } from 'src/shared/utils/crypto.util';
import { Repository } from 'typeorm';

import { LoginDto } from './dto/login.dto';
import { RefreshAdministratorToken } from './entities/refresh-administrator-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshWorkerToken } from './entities/refresh-worker-token.entity';
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
    private readonly workerService: WorkerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,

    @InjectRepository(RefreshAdministratorToken)
    private readonly refreshAdminTokenRepo: Repository<RefreshAdministratorToken>,

    @InjectRepository(RefreshWorkerToken)
    private readonly refreshWorkerTokenRepo: Repository<RefreshWorkerToken>,
  ) {}

  async login(data: LoginDto, ip: string, userAgent = ''): Promise<LoginResponse> {
    let account: {
      id: number;
      identity: string;
      passwordHash: string;
      role: Role;
      userId?: number;
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
      const user = await this.userService.getUserByEmail(data.identity);

      if (user) {
        account = {
          id: user.userId,
          identity: user.email,
          passwordHash: user.passwordHash,
          role: Role.USER,
        };
      } else {
        const worker = await this.workerService.getWorkerByName(data.identity);

        if (worker) {
          account = {
            id: worker.workerId,
            identity: worker.name,
            passwordHash: worker.password,
            role: Role.WORKER,
            userId: worker.userId,
          };
        }
      }
    }

    if (!account) {
      throw new UnauthorizedException('Invalid identity or password');
    }

    const isPasswordCorrect = await CryptoUtil.comparePassword(data.password, account.passwordHash);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid identity or password');
    }

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
    let tokenRecord: IDatabaseToken | null = null;

    if (payload.role === Role.ADMINISTRATOR) {
      tokenRecord = await this.getAdminToken(token);
    } else if (payload.role === Role.WORKER) {
      tokenRecord = await this.getWorkerToken(token);
    } else {
      tokenRecord = await this.getUserToken(token);
    }

    this.validateDatabaseToken(tokenRecord);

    if (payload.role === Role.ADMINISTRATOR) {
      await this.invalidateAdminToken(token);
    } else if (payload.role === Role.WORKER) {
      await this.invalidateWorkerToken(token);
    } else {
      await this.invalidateUserToken(token);
    }

    return this.generateSession(
      payload.Id,
      payload.identity,
      payload.role,
      ip,
      userAgent,
      payload.userId,
    );
  }

  async createToken(userId: number, expireAt: string, refreshToken: string): Promise<RefreshToken> {
    const userRefreshToken = new RefreshToken();
    userRefreshToken.userId = userId;
    userRefreshToken.refreshToken = refreshToken;
    userRefreshToken.expireAt = new Date(expireAt);

    return await this.refreshTokenRepo.save(userRefreshToken);
  }

  async getUserToken(token: string): Promise<RefreshToken> {
    const userToken = await this.refreshTokenRepo.findOne({ where: { refreshToken: token } });
    if (!userToken) {
      throw new NotFoundException('Refresh token not found.');
    }
    return userToken;
  }

  async invalidateUserToken(token: string): Promise<void> {
    const userToken = await this.getUserToken(token);
    userToken.isValid = 0;
    await this.refreshTokenRepo.save(userToken);
  }

  async invalidateAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepo.update({ userId: userId, isValid: 1 }, { isValid: 0 });
  }

  async createAdminToken(
    administratorId: number,
    expireAt: string,
    refreshAdminToken: string,
  ): Promise<RefreshAdministratorToken> {
    const adminRefreshToken = new RefreshAdministratorToken();
    adminRefreshToken.administratorId = administratorId;
    adminRefreshToken.refreshAdministratorToken = refreshAdminToken;
    adminRefreshToken.expireAt = new Date(expireAt);

    return await this.refreshAdminTokenRepo.save(adminRefreshToken);
  }

  async getAdminToken(token: string): Promise<RefreshAdministratorToken> {
    const adminToken = await this.refreshAdminTokenRepo.findOne({
      where: { refreshAdministratorToken: token },
    });

    if (!adminToken) {
      throw new NotFoundException('Refresh token not found');
    }

    return adminToken;
  }

  async invalidateAdminToken(token: string): Promise<void> {
    const adminToken = await this.getAdminToken(token);
    adminToken.isValid = 0;
    await this.refreshAdminTokenRepo.save(adminToken);
  }

  async invalidateAllAdminTokens(administratorId: number): Promise<void> {
    await this.refreshAdminTokenRepo.update(
      { administratorId: administratorId, isValid: 1 },
      { isValid: 0 },
    );
  }

  async createWorkerToken(
    workerId: number,
    expireAt: string,
    refreshWorkerToken: string,
  ): Promise<RefreshWorkerToken> {
    const workerToken = this.refreshWorkerTokenRepo.create({
      workerId,
      refreshWorkerToken,
      expireAt: new Date(expireAt),
    });

    return await this.refreshWorkerTokenRepo.save(workerToken);
  }

  async getWorkerToken(token: string): Promise<RefreshWorkerToken> {
    const workerToken = await this.refreshWorkerTokenRepo.findOne({
      where: { refreshWorkerToken: token },
    });

    if (!workerToken) {
      throw new NotFoundException('Refresh token not found');
    }

    return workerToken;
  }

  async invalidateWorkerToken(token: string): Promise<void> {
    const workerToken = await this.getWorkerToken(token);
    workerToken.isValid = 0;
    await this.refreshWorkerTokenRepo.save(workerToken);
  }

  async invalidateAllWorkerTokens(workerId: number): Promise<void> {
    await this.refreshWorkerTokenRepo.update({ workerId: workerId, isValid: 1 }, { isValid: 0 });
  }

  private buildPayload(
    id: number,
    identity: string,
    role: Role,
    ip: string,
    userAgent: string,
    userId?: number,
  ): JwtPayload {
    return { Id: id, identity, role, ipAddress: ip, userAgent, userId };
  }

  private async generateSession(
    id: number,
    identity: string,
    role: Role,
    ip: string,
    userAgent: string,
    userId?: number,
  ): Promise<LoginResponse> {
    const payload = this.buildPayload(id, identity, role, ip, userAgent, userId);
    const secret = this.configService.get<string>('JWT_SECRET') || 'DEFAULT_SECRET_PRODUKCIJA';

    const token = this.jwtService.sign(payload, { expiresIn: '5m', secret });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '31d', secret });

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 31);

    if (role === Role.ADMINISTRATOR) {
      await this.createAdminToken(id, expireDate.toISOString(), refreshToken);
    } else if (role === Role.WORKER) {
      await this.createWorkerToken(id, expireDate.toISOString(), refreshToken);
    } else {
      await this.createToken(id, expireDate.toISOString(), refreshToken);
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

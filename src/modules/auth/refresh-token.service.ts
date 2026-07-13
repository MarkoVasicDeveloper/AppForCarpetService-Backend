import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/shared/enums/role.enum';
import { Repository } from 'typeorm';

import { RefreshAdministratorToken } from './entities/refresh-administrator-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshWorkerToken } from './entities/refresh-worker-token.entity';

interface RoleRegistryConfig {
  repo: Repository<RefreshAdministratorToken | RefreshToken | RefreshWorkerToken>;
  idField: string;
  tokenField: string;
}

interface ITokenRecord {
  isValid: number;
  expireAt: string | Date;
  userId?: number;
  [key: string]: unknown;
}

@Injectable()
export class RefreshTokenService {
  private readonly roleRegistry = new Map<Role, RoleRegistryConfig>();
  constructor(
    @InjectRepository(RefreshToken) private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(RefreshAdministratorToken)
    private readonly refreshAdminTokenRepo: Repository<RefreshAdministratorToken>,
    @InjectRepository(RefreshWorkerToken)
    private readonly refreshWorkerTokenRepo: Repository<RefreshWorkerToken>,
  ) {
    this.roleRegistry.set(Role.ADMINISTRATOR, {
      repo: this.refreshAdminTokenRepo,
      idField: 'administratorId',
      tokenField: 'refreshAdministratorToken',
    });
    this.roleRegistry.set(Role.USER, {
      repo: this.refreshTokenRepo,
      idField: 'userId',
      tokenField: 'refreshToken',
    });
    this.roleRegistry.set(Role.WORKER, {
      repo: this.refreshWorkerTokenRepo,
      idField: 'workerId',
      tokenField: 'refreshWorkerToken',
    });
  }

  async saveToken(role: Role, id: number, token: string, expireAt: Date): Promise<void> {
    const config = this.getRegistryOrThrow(role);
    await config.repo
      .createQueryBuilder()
      .insert()
      .values({
        [config.tokenField]: token,
        [config.idField]: id,
        expireAt,
        isValid: 1,
      })
      .execute();
  }

  async findToken(role: Role, token: string): Promise<ITokenRecord | null> {
    const config = this.getRegistryOrThrow(role);
    return (await config.repo.findOne({
      where: { [config.tokenField]: token },
    })) as unknown as ITokenRecord | null;
  }

  async invalidateToken(role: Role, token: string): Promise<void> {
    const config = this.getRegistryOrThrow(role);
    await config.repo
      .createQueryBuilder()
      .update()
      .set({ isValid: 0 })
      .where(`${config.tokenField} = :token`, { token })
      .execute();
  }

  async invalidateAllForEntity(role: Role, foreignId: number): Promise<void> {
    const config = this.getRegistryOrThrow(role);
    await config.repo
      .createQueryBuilder()
      .update()
      .set({ isValid: 0 })
      .where(`${config.idField} = :foreignId`, { foreignId })
      .andWhere('isValid = 1')
      .execute();
  }

  async invalidateWorkerTokensByUserId(userId: number): Promise<void> {
    await this.refreshWorkerTokenRepo
      .createQueryBuilder()
      .update(RefreshWorkerToken)
      .set({ isValid: 0 })
      .where('userId = :userId', { userId })
      .andWhere('isValid = 1')
      .execute();
  }

  public getRegistryOrThrow(role: Role): RoleRegistryConfig {
    const config = this.roleRegistry.get(role);
    if (!config) {
      throw new UnauthorizedException('Unsupported role configuration');
    }
    return config;
  }
}

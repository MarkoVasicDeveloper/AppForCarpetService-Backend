import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Role } from 'src/shared/enums/role.enum';

import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class AuthEventListener {
  private readonly logger = new Logger(AuthEventListener.name);
  constructor(private readonly tokenService: RefreshTokenService) {}

  @OnEvent('*.credentials.changed')
  @OnEvent('*.deleted')
  async handleTokenInvalidationEvents(payload: {
    adminId?: number;
    userId?: number;
    workerId?: number;
  }): Promise<void> {
    try {
      if (payload.adminId)
        await this.tokenService.invalidateAllForEntity(Role.ADMINISTRATOR, payload.adminId);
      if (payload.userId) {
        await this.tokenService.invalidateAllForEntity(Role.USER, payload.userId);
        await this.tokenService.invalidateWorkerTokensByUserId(payload.userId);
      }
      if (payload.workerId)
        await this.tokenService.invalidateAllForEntity(Role.WORKER, payload.workerId);
    } catch (error) {
      this.logger.error(`Event token invalidation failed`, error);
    }
  }
}

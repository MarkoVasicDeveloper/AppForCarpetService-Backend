import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { NotificationService } from './notification.service';

@Injectable()
export class NotificationListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('user.registered')
  async handleUserRegistered(payload: {
    email: string;
    name: string;
    token: string;
  }): Promise<void> {
    await this.notificationService.sendEmail(
      payload.email,
      'Verify Your Washer App Account',
      'welcome',
      {
        name: payload.name,
        token: payload.token,
      },
    );
  }
}

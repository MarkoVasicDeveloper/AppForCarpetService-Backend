import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { NotificationService } from './notification.service';

@Injectable()
export class NotificationListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('user.registered')
  async handleUserRegistered(payload: { email: string; name: string }) {
    await this.notificationService.sendEmail(payload.email, 'Welcome to Washer App!', 'welcome', {
      name: payload.name,
    });
  }
}

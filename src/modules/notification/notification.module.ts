import { Module, Global } from '@nestjs/common';

import { NotificationListener } from './notification.listener';
import { NotificationService } from './notification.service';

@Global()
@Module({
  providers: [NotificationService, NotificationListener],
  exports: [NotificationService],
})
export class NotificationModule {}

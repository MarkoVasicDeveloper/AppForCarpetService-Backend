import { forwardRef, Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';

import { MailerController } from './mailer.controller';
import { UserMailerService } from './mailer.service';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [MailerController],
  providers: [UserMailerService],
  exports: [UserMailerService],
})
export class MailerModule {}

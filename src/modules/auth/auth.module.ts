import { Module } from '@nestjs/common';

import { AdministratorModule } from '../administrator/administrator.module';
import { UserModule } from '../user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [AdministratorModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

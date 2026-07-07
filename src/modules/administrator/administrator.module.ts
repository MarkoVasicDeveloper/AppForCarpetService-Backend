import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { AdministratorController } from './administrator.controller';
import { Administrator } from './administrator.entity';
import { AdministratorService } from './administrator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Administrator]), forwardRef(() => AuthModule)],
  controllers: [AdministratorController],
  providers: [AdministratorService],
  exports: [AdministratorService],
})
export class AdministratorModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';

import { AdministratorController } from './administrator.controller';
import { Administrator } from './administrator.entity';
import { AdministratorService } from './administrator.service';
import { RefreshAdministratorToken } from '../auth/entities/refresh-administrator-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Administrator, RefreshAdministratorToken]), UserModule],
  controllers: [AdministratorController],
  providers: [AdministratorService],
  exports: [AdministratorService, TypeOrmModule],
})
export class AdministratorModule {}

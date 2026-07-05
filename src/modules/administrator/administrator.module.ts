import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RefreshAdministratorToken } from '../auth/entities/refresh-administrator-token.entity';

import { AdministratorController } from './administrator.controller';
import { Administrator } from './administrator.entity';
import { AdministratorService } from './administrator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Administrator, RefreshAdministratorToken])],
  controllers: [AdministratorController],
  providers: [AdministratorService],
  exports: [AdministratorService],
})
export class AdministratorModule {}

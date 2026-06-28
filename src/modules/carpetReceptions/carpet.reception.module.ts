import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarpetReception } from 'entities/CarpetReception';

import { CarpetController } from '../carpet/carpet.controller';
import { CarpetService } from '../carpet/carpet.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarpetReception])],
  controllers: [CarpetController],
  providers: [CarpetService],
  exports: [CarpetService, TypeOrmModule],
})
export class CarpetReceprionModule {}

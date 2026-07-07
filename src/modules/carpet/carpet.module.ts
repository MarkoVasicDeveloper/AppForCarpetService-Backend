import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CarpetController } from './carpet.controller';
import { Carpet } from './carpet.entity';
import { CarpetService } from './carpet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Carpet])],
  controllers: [CarpetController],
  providers: [CarpetService],
  exports: [CarpetService, TypeOrmModule],
})
export class CarpetModule {}
